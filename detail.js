
var url = require('url'),
    out = require("./output"),
    db = require("./database"),
    theKnowledge = require("./dataKnowledge");



// List a 'row's' contents
function Detail(request, response) {
	
	try
	{
		var url_parts = url.parse(request.url, true);
		var query = url_parts.query;
	

		var session = query['session'];
		
		// check session 
		if (session == null || session.length == 0) {
			out.HomeOutput('logon', response);  
			return;
		}		
		
		// get a list of properties associated with the table
		// - this would normally be stored in the db
		var properties = theKnowledge.GetDataProperties(query['type']);
		
		var data = {}
		data['nodeId'] = query['node'];
		data['nodeType'] = query['type'];		
		data['session'] = session;
		data['properties'] = properties;  
		
		db.GetSession(request, response, data, StartDetail);
	
	}
	catch (err)
	{
		out.DetailOutput('error', response, err);
	}
}

function StartDetail(request, response, data, result, name)
{
	console.log('start detail: ' + result);
	
	if (result) {
		var session = data['session'];
		
		// get list of properties from database
		db.GetDetail(data['nodeType'], data['nodeId'], data['properties'], session, response, FinishDetail);		
	}
	else {
		out.HomeOutput('logon', response);  
		return;		
	}
 

}

// Detail properties retrieved from database, output to HTML and send to client
function FinishDetail(dataName, response, session, result)
{
	console.log('finish detail: ' + dataName);

	// something went wrong - 500 error
	if (dataName == 'error')
	{
		out.ListOutput('error', response, result);
		return;
	}	
	
    // start HTML creation
	var data = {}
	data['dataName'] = dataName;	
	data['session'] = session;
	var output = out.DetailOutput('init', response, data, output);
	
	var content = '';
	for (var dataEntry in result) {
		var data = {}
		// the key
		data['data'] = dataEntry;
		// the value
		data['desc'] = result[dataEntry];
		// pump out the html
		content = out.DetailOutput('row', response, data, content);
	}
	output = out.DetailOutput('content', response, content, output)	
	// send to client
	out.DetailOutput('end', response, null, output);	
}




exports.Detail = Detail;