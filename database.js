
var theKnowledge = require("./dataKnowledge");
var neo4j = require('neo4j');


var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

var rootId = 0;

function GetRoot (callback)
{
    db.getNodeById(rootId, function (err, results) 
    {
        if (err) {
        	callback(err);
        }
        else {
        	var rel = results[0];
        	callback(null, rel);
        }
    });
}

function CreateRoot ()
{
	console.log("CreateRoot called.");
    try
    {   	
       var rootNode = db.createNode({IsRoot: "true"});
       rootNode.save(function (err) {
        	if (err) {
    	   	    console.log("Save node error: " + err); 
    	   		throw (err);
           	}
            //console.log("Node saved: " + rootNode); 
       });
    }
    catch (err) {
    	
    	throw(err);
    }
}

function AddRawData(dataName, dataMap, count, totalCount)
{
    db.getNodeById(rootId, function (err, root) {
    	
    	if (err) {
    	   console.log("Could not get root record: " + err); 
    	}
    	else {
    	    
    	    try {
        	  console.log("Add data (" + dataName + "), count: " + count); 
        	  var headings = dataMap["0"];
        	         	  
    	      for (var i = 1; i <= count; i++) {

    	    	  AddDataNode(root, headings, dataName, dataMap[i], count, totalCount);  	      
    	      }
    	    }
    	    catch (err)
    	    {
	    	    console.log("Error caught: " + err); 
    	    }   	           
    	}
    });
	
}

function AddDataNode(root, headings, dataName, dataMap, count, totalCount)
{
	
	// create list of properties
	var props = {}
	var propCount = 0;
	for (var prop in headings) {
		var heading = headings[prop];
		
		// do some data casting
		switch (theKnowledge.GetFieldType(heading)) {
			case 'int':
			case 'money':				
				props[heading] = parseInt(dataMap[propCount]) || 0;
				break;
			case 'date':
				var dateVar =  Date.parse(dataMap[propCount]);
				console.log('date is ' + dateVar);
				if (isNaN(dateVar) == true) {
					props[heading] = 'Invalid';					
				}
				else {
					props[heading] = new Date(dataMap[propCount]);
				}
				break;
			case 'phone':
				var phone = dataMap[propCount];
				phone = phone.replace(/-/g, ''); // remove dashes
				props[heading] = phone;
				break;
			case 'string':				
			default:
				props[heading] = dataMap[propCount];				
				break;
		}
		propCount++;
	}
	

	// concat first and last name fields
	if (props['FirstName'] && props['LastName'] && !props['Name']) {
		props['Name'] = props['FirstName'] + ' ' + props['LastName']	
	}
	
	
	// create the node itself
    var newNode = db.createNode(props);

    newNode.save(function (err) {
     	if (err) {
	   	    console.log("Save node error: " + err); 
	   		throw (err);
       	}
        console.log("Node saved: " + newNode); 

        // create a relationship based on name of data and link to root
        var link_relationship = 'HAS_' + dataName;
	    root.createRelationshipTo(newNode, link_relationship, {}, function (err, rel)           	    
	    {	       	
	       	if (err) {
        	    console.log("Create relationship error: " + err); 
        		throw (err);
	       	}   
	       	else {
	            console.log("Relationship created to: " + newNode); 	      
	            
	            var key = 'Id';
	    	    if (!props['Id']) 	{
	    	    	for (var xkey in props) {
	    	    		if (xkey.indexOf('Id') != -1) {
	    	    			key = xkey;
	    	    			break;
	    	    		}
	    	    	}
	    	    }
	    	    	
	    	    // create an index
	    	    var indexName = "IDX_" + dataName;
	    	    var indexKey = key;
	    	    if (props[key]) {
	    	    	var indexValue = props[key];
	    	    }
	    	    else {
	    	    	var indexValue = 'None';
	    	    }
	    	    	
	    	    newNode.index(indexName, indexKey, indexValue, function (err) {
	    	    	if (err) {	
	    	    		console.log("Save index error: " + err);
	    	    		throw (err);
	    	    	}	
	    	    	else {
	    	    		console.log('index created for ' + indexName + ", value: " + indexValue); 
	    	    				
	    		  	    ConnectData(dataName, newNode, props);
	    	    	}
	    	    				
	    	    });
	       	}
	    }); 
     });
}

function ConnectData(dataName, node, props) 
{
	switch (dataName) {
	case 'Individual_Stock':
		ConnectIndividualToStock(dataName, node, props['PersonId'], props['StockId']);
		break;
	case 'Individual_TaxRecord':
		ConnectIndividualToTaxRecord(dataName, node, props['PersonId'], props['FinancialYearId']);
		break;
	case 'Individual_Relation':
		ConnectIndividualToRelation(dataName, node, props['PersonId1'], props['RelatedAs'], props['PersonId2']);
		break;		
	case 'Individual':
	case 'Business':		
		ConnectToManager(dataName, node, props['Id'], props['ManagedBy']);	
		break;			

	default:
		break;
	}	
}

function ConnectIndividualToStock(dataName, node, personId, stockId)
{
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Individual(Id="LOOKUP1"), second=node:IDX_Stock(Id="LOOKUP2")',
                 'MATCH (root)-[:HAS_Individual]->(first), (root)-[:HAS_Stock]->(second)',
                 'WHERE first.Id = "LOOKUP1" AND second.Id = "LOOKUP2"',
                 'RETURN first, second'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, personId)
    		 .replace(/LOOKUP2/g, stockId);
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
                	 console.log(err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
                		    var node1 = results[0]['first'];   
                		    var node2 = results[0]['second'];

                		    console.log('join ' + node1.id + ' with node ' + node2.id);
                		    
                		    // create the relationships 
                	        var link_relationship = 'HAS_Stockholding';
                		    node1.createRelationshipTo(node, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                		       		var errstr = "Create relationship " + link_relationship + ",  error: " + err;
                	        	    console.log(errstr); 
                		       		console.log(' >>>  Connect individual ' + node1.id + ' with stock record ' + node.id);
                		       	}   
                		       	else {                		       		
                		       		console.log('Connect individual ' + node1.id + ' with stock record ' + node.id);
                		       	}
                		    });        

                	        link_relationship = 'HAS_Stock';
                		    node.createRelationshipTo(node2, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                	        	    console.log("Create relationship error: " + err); 
                		       	}   
                		    });  
                		}
                 }
             });	
}

function ConnectIndividualToTaxRecord(dataName, node, personId, yearId)
{
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Individual(Id="LOOKUP1"), second=node:IDX_FinancialYear(Id="LOOKUP2")',
                 'MATCH (root)-[:HAS_Individual]->(first), (root)-[:HAS_FinancialYear]->(second)',
                 'WHERE first.Id = "LOOKUP1" AND second.Id = "LOOKUP2"',
                 'RETURN first, second'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, personId)
    		 .replace(/LOOKUP2/g, yearId);
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
                	 console.log(err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
                		    var node1 = results[0]['first'];   
                		    var node2 = results[0]['second'];
                		    
                		    // create the relationships 
                	        var link_relationship = 'HAS_TaxRecord';
                		    node1.createRelationshipTo(node, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                		       		var errstr = "Create relationship " + link_relationship + ",  error: " + err;
                	        	    console.log(errstr);
                		       		console.log(' >>>> Connect individual ' + node1.id + ' with tax record ' + node.id);
                		       	}   
                		       	else {
                		       		console.log('Connect individual ' + node1.id + ' with tax record ' + node.id);
                		       	}
                		    });        

                	        link_relationship = 'HAS_Individual_TaxRecord';
                		    node2.createRelationshipTo(node, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                	        	    console.log("Create relationship error: " + err); 
                		       	}   
                		       	
                		    });  
                		}
                 }
             });	
}

function ConnectToManager(dataName, node, entityId, managerId)
{
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Partner(Id="LOOKUP1")',
                 'MATCH (root)-[:HAS_Partner]->(first)',
                 'WHERE first.Id = "LOOKUP1"',
                 'RETURN first'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, managerId);
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
                	 console.log(err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
                		    var node1 = results[0]['first'];   
                  		    
                		    // create the relationships 
                	        var link_relationship = 'HAS_Client';
                		    node1.createRelationshipTo(node, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                		       		var errstr = "Create relationship " + link_relationship + ",  error: " + err;
                	        	    console.log(errstr);
                		       		console.log('  >>> Connect Partner ' + node1.id + ' with entity ' + node.id);
                	        	    
                		       	}   
                		       	else {
                		       		console.log('Connect Partner ' + node1.id + ' with entity ' + node.id);
                		       	}
                		    });        

                		}
                 }
             });	
}


function ConnectIndividualToRelation(dataName, node, person1Id, relationId, person2Id)
{
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Individual(Id="LOOKUP1"), second=node:IDX_Relation(Id="LOOKUP2"), third=node:IDX_Individual(Id="LOOKUP3")',
                 'MATCH (root)-[:HAS_Individual]->(first), (root)-[:HAS_Relation]->(second), (root)-[:HAS_Individual]->(third)',
                 'WHERE first.Id = "LOOKUP1" AND second.Id = "LOOKUP2" AND third.Id = "LOOKUP3"',
                 'RETURN first, second, third'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, person1Id)
    		 .replace(/LOOKUP2/g, relationId)
    		 .replace(/LOOKUP3/g, person2Id);
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
                	 console.log(err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
                		    var node1 = results[0]['first'];   
                		    var node2 = results[0]['second'];
                		    var node3 = results[0]['third'];
                		    
                		    console.log('join ' + node1.id + ' with node ' + node2.id);
                		    
                		    // create the relationships 
                	        var link_relationship = 'HAS_InterRelationship';
                		    node1.createRelationshipTo(node3, link_relationship, {}, function (err, rel)           	    
                		    {                		       
                		       	if (err) {
                		       		var errstr = "Create relationship " + link_relationship + ",  error: " + err;
                	        	    console.log(errstr);
                		       		console.log(' >>> Connect individual ' + node1.id + ' with individual record ' + node3.id);                	        	    
                		       	}   
                		       	else {                		       		
                		       		console.log('Connect individual ' + node1.id + ' with individual record ' + node3.id);
                		       	}
                		    });        
                		}
                 }
             });	
}

function GetSession(request, response, data, callback)
{
	
	var sessionId = data['session'];
	
	console.log('get session: ' + sessionId);
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Session(id="LOOKUP1")',
                 'MATCH (root)-[:HAS_Session]->(first)',
                 'WHERE first.id = "LOOKUP1"',
                 'RETURN first.name AS Name'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, sessionId)
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
             		console.log('get session failed - ' + err);
         		    callback(request, response, data, false, 'get session: ' + err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
                		 var name = results[0]['Name']; 
              		     callback(request, response, data, true, name);                		 
                	}
                	else {
                		console.log('get session failed - not found');
             		    callback(request, response, data, false, 'get session: no result');
                	}
                 }
             });	
}

function KillSession(sessionId)
{
	
	
	console.log('kill session: ' + sessionId);
	
	var query = [
                 'START root=node(ROOTID), first=node:IDX_Session(id="LOOKUP1")',
                 'MATCH (root)-[:HAS_Session]->(first)',
                 'WHERE first.id = "LOOKUP1"',
                 'RETURN first'
             ].join('\n')
             .replace('ROOTID', rootId)
             .replace(/LOOKUP1/g, sessionId)
    
             var params = {}

             db.query(query, params, function (err, results) {
                 if (err) {
             		console.log('kill session failed - ' + err);
                 }
                 else {
                	 if (results.length > 0) {
                		 
             		    var node = results[0]['first'];  
             		    
             		    try {
             		    	node.del(function (err) {
             		        	if (err) {
             		    	   	    console.log("delete node error: " + err); 
             		    	   	    
             		           	}

             		        }, true);
             		    }
             		    catch (err)
             		    {
                    		console.log('kill session failed - ' + err);
             		    }
             		 
                	}
                	else {
                		console.log('kill session failed - not found');
                	}
                 }
             });	
}


function SetSession(request, response, name, sessionId, callback)
{
	
	// create a random session token
	
	var props = {}
	
	props['name'] = name;
	props['id'] = sessionId;
	
    db.getNodeById(rootId, function (err, root) {
    	if (err) {
    		    callback(request, response, false, 'get root: ' + err);
    	   	    return;
    	}

	
	   // create the node itself
       var newNode = db.createNode(props);

       newNode.save(function (err) {
     	if (err) {
	   	    callback(request, response, false, 'save node: ' + err);
	   	    return;
       	}

        // create a relationship based on name of data and link to root
        var link_relationship = 'HAS_Session';
	    root.createRelationshipTo(newNode, link_relationship, {}, function (err, rel)           	    
	    {	       	
	       	if (err) {
		   	    callback(request, response, false, 'create relationship');
		   	    return;
	       	}   
	       	else {
    	    	
	    	    // create an index
	    	    var indexName = "IDX_Session";
	    	    var indexKey = 'id';
    	    	var indexValue = sessionId;
	    	    	
	    	    newNode.index(indexName, indexKey, indexValue, function (err) {
	    	    	if (err) {	
	    		   	    callback(request, response, false, 'create index');
	    		   	    return;
	    	    	}	
	    	    	else {
	    	    		var data = {}
	    	    		data['name'] = name;
	    	    		data['session'] = sessionId;
	    	    		callback(request, response, true, data)	
	    	    	}
	    	    				
	    	    });
	            
	       	}
	    });     
	    
     });
    });

	
}


function GetList(dataName, response, session, callback)
{
	
    var query = [
                 'START root=node(ROOTID)',
                 'MATCH (root) -[rel?:RelName]->(other)',
                 'RETURN other, other.Id AS Id, other.DESCFIELD'
             ].join('\n')
             .replace('RelName', 'HAS_' + dataName)
             .replace('ROOTID', rootId)
             .replace('DESCFIELD', theKnowledge.GetDescriptionField(dataName) + " AS description");
   
             var params = {}
             var data = {}  // list of data descriptions

             db.query(query, params, function (err, results) {
                 if (err) {
                	 callback('error', response, data);
                 }
                 else {
                	 for (var i = 0; i < results.length; i++) {
                		 var node = results[i]['other'];        
                		 
                		 var lineData = {}
                		 lineData['NodeId'] = node.id;
             		 
                		 lineData['Name'] = results[i]['description'];
                		 lineData['Id'] = results[i]['Id'];                		 
                		 data[i] = lineData;
                	 }
                	 callback(dataName, response, session, data);
                 }
             });	
}

function GetAjaxList(dataName, response, session, callback)
{

	if (dataName == 'wealthy') {
		
		var query = [
		             'START root=node(ROOTID)', 
		             'MATCH root -[:HAS_Individual]->b-[:HAS_Stockholding]->c',
		             'RETURN b, b.Name AS Name, b.Mobile AS Mobile, SUM(c.Quantity) AS Total',        
		             'ORDER BY Total DESC'
		           ].join('\n')
		           .replace('ROOTID', rootId);
	}
	else {
	    var query = [
	                 'START root=node(ROOTID)', 
	                 'MATCH root -[:HAS_Individual]->b-[:HAS_TaxRecord]->c',
	                 'RETURN b, b.Name AS Name, b.Mobile AS Mobile, AVG(c.Income) AS Total',        
	                 'ORDER BY Total DESC'
	             ].join('\n')
	             .replace('ROOTID', rootId);		
	}
   
             var params = {}
             var data = {}  // list of data descriptions

             db.query(query, params, function (err, results) {
                 if (err) {
                	 callback(dataName, response, session, data);
                 }
                 else {

                	 for (var i = 0; i < results.length, i < 10; i++) {
                		 var node = results[i]['b'];
 
                		 var lineData = {}
                		 lineData['NodeId'] = node.id; ;
                		 lineData['Name'] = results[i]['Name'];
                		 lineData['Mobile'] = FormatDataString('Mobile', results[i]['Mobile']);
                		 lineData['Total'] = FormatDataString('Total', results[i]['Total']);
                		 data[i] = lineData;
                	 }
                	 callback(dataName, response, session, data);
                 }
             });	
}


function GetSearch(searchFor, response, session, callback)
{
	
    var query = [
                 'START root=node(ROOTID)',
                 'MATCH (root) -[r:HAS_Individual | HAS_Business]->(other)',
                 'WHERE other.Name =~ /.*(?i)LOOKUP.*/',
                 'RETURN other, other.Name AS Name, other.Id AS Id, type(r) AS rel',
                 'ORDER BY other.Name'
             ].join('\n')
             .replace('LOOKUP', searchFor)
             .replace('ROOTID', rootId);
     
             var params = {}
             var data = {}  // list of data descriptions

             db.query(query, params, function (err, results) {
                 if (err) {
                	 console.log(err);
                	 callback(response, data, session, 'error');
                 }
                 else {
                	 data
                	 for (var i = 0; i < results.length; i++) {
                		 var node = results[i]['other'];

                		 var lineData = {}
                		 lineData['NodeId'] = node.id; ;
                		 lineData['Name'] = results[i]['Name'];   
                		 lineData['Id'] = results[i]['Id'];  
               		     var rel =  results[i]['rel'];             		     
               		     if (rel.length > 4) {
               		    	lineData['dataName'] = rel.substr(4);
               		     }
               		     else {
                		   	lineData['dataName'] = 'Individual';               		    	 
               		     }
                		 data[i] = lineData;
                	 }
                	 callback(response, data, session, searchFor);
                 }
             });	
}


function GetDetail(dataName, dataValue, dataProperties, session, response, callback)
{
	
	try
	{
	   var propertiesToGet = "";
	   var count = 0;
	   for (var property in dataProperties) {
		   if (count > 0) {
			   propertiesToGet = propertiesToGet + ", ";
		   }
		   propertiesToGet = propertiesToGet + "n." + dataProperties[property] + " AS " + dataProperties[property];	
		   count++;
	   }
	
	   var query = [
                 'START n=node(NODEID)',
                 'RETURN PROPLIST'
             ].join('\n')
             .replace('NODEID', dataValue)
             .replace('PROPLIST', propertiesToGet);
      
             var params = {}
             var list = {}  // list of node id

             db.query(query, params, function (err, results) {
                 if (err) {
                	 // flag an error to the callback
                	 callback('error', response, session, err);
                 }
                 else {
                	 
               	 
                	 if (results.length > 0) {
                		 for (var data in results[0]) {
               			 
                			 list[data] = FormatDataString(data, results[0][data]);               		 
                		 }
                	 }
                	 callback(dataName, response, session, list);
                 }
             });	
	}
	catch (err)
	{
   	 	callback('error', response, session, err);
	}

}


function ClearDatabase()
{
    db.getNodeById(rootId, function (err, root) {
    	
    	if (err) {
    	   console.log("Could not get root record: " + err); 
    	}
    	else {

   		
    	}
    });
}

function FindNodes()
{
	
	console.log("Searching for nodes. Ctl-Brk to stop");
	
	for (var i = 0; i< 100000; i++) {
		
	    db.getNodeById(rootId, function (err, root) {
	    	
	    	if (err) {
	    	   ;
	    	}
	    	else {
		       console.log("Found node at: " + i);
	    	}
	    });
	    
	    if ((i % 1000) == 0) {
		    console.log(i);	    	
	    }	       
	}
    console.log("Search finished");		
}


// Format known field types 
function FormatDataString(heading, value) {
	
	if (typeof heading === 'undefined' || typeof value === 'undefined') {
		return '';
	}
	
	// do some data casting
	switch (theKnowledge.GetFieldType(heading)) {
		case 'int':
			var num = parseInt(value) || 0;
			
		case 'money':	
			var val = value.toString();
		
			var arParts = val.split('.');
			val = arParts[0];	
			var len = val.length;
				
			
			// TODO put this in a loop
			if (len > 9) {	
				AmountWithCommas = val.substring(0, len - 9) + ',' + val.substr(len - 9, 3) + ',' + val.substr(len - 6, 3) + ',' + val.substr(len - 3, 3);
			}
			else if (len > 6) {	
				AmountWithCommas = val.substring(0, len - 6) + ',' + val.substr(len - 6, 3) + ',' + val.substr(len - 3, 3);
			}
			else if (len > 3) {			
				AmountWithCommas = val.substring(0, len - 3) + ',' + val.substr(len - 3, 3);
			}			

			var intPart = AmountWithCommas;
			var decPart = (arParts.length > 1 ? arParts[1] : '');
			decPart = (decPart + '00').substr(0,2);
			return '$' + intPart + '.' + decPart;

		case 'date':
			var dateVar =  Date.parse(value);
			if (isNaN(dateVar) == true) {
				return 'Invalid';					
			}
			else {
				var date = new Date(value);
				return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear(); 
			}
			
		case 'phone':
			// these have irregular formatting
			var phone = value.replace(/-/g, ''); // remove dashes
			if (phone.length == 10) {
				phone = phone.substr(0, 4) + "-" + phone.substr(4, 3) + "-" + phone.substr(7, 3);
			}
			return phone;
			break;			

		case 'string':
		default:
			return value;				
	}
}




exports.ClearDatabase = ClearDatabase;
exports.GetRoot = GetRoot;
exports.CreateRoot = CreateRoot;
exports.AddRawData = AddRawData;
exports.FindNodes = FindNodes;
exports.GetList = GetList;
exports.GetSearch = GetSearch;
exports.GetDetail = GetDetail;
exports.GetAjaxList = GetAjaxList;
exports.SetSession = SetSession;
exports.GetSession = GetSession;
exports.KillSession = KillSession;

