
var path = require("path"),  
	fs = require("fs");
var db = require("./database"),
    out = require("./output"),
    dataKnowledge = require("./dataKnowledge");


// Import all tables into the system
function Upload(response)
{
	console.log("Request handler 'upload' was called.");
	
	// get our table names list (the things to import)
	var list = dataKnowledge.GetTableNames();
	var last = '';
	for (var i in list) {
		last = list[i];
	}
		
	out.UploadOutput('init', response);	
	for (var i in list) {
		var isLast = false; 
		if (list[i] == last) {
			isLast = true;
		}					
		UploadData(list[i], response, isLast)
	}		
}


function UploadData(dataName, response, isLast) {
	  console.log("uploadData was called with " + dataName);

	  try
	  {
		var file = "data/" + dataName + ".csv";
	    var filename = path.join(process.cwd(), file);
	    
	    var dataMap = {};
	    var count = 0;
	    var totalCount = 0;

	    // work out encoding -it's not corrupted, it's encoded dude
	    var bytes = new Buffer(10);
	    var fd = fs.openSync(filename,'r');
	    fs.readSync(fd, bytes, 0, 10, 0);
	    fs.closeSync(fd);
   
	    var p = bytes[0];
	    var q = bytes[1];
	    var r = bytes[2];
	    var s = bytes[3];
	    
	    var encoding = 'ascii';
	    
	    if (p == 255 && q == 254) {
	    	encoding = 'utf16le';
	    }
	    else if (p == 254 && q == 255) {
	    	encoding = 'utf16';
	    }
	    else if (p == 239 && q == 187 && r == 191) {
	    	encoding = 'utf8';
	    }  	    
	    else if (p == 0 && q == 0 && r == 254 && s == 255) {
	    	encoding = 'utf32le';
	    }    
	    else if (p == 0 && q == 0 && r == 255 && s == 254) {
	    	encoding = 'utf32';
	    }
	    
	    console.log("encoding detected: " + encoding);
	    
	    // First read the entire file
	    fs.readFile(filename, encoding, function (err, data) {
	       if (err) {
	           throw err;
	       }

	       // convert to ascii buffer
	       var buffer = new Buffer(data, 'ascii');
	       // trim off unicode BOM
	       data = buffer.toString().substring(1);
	       // split into lines
	       var line = data.split("\n");
	       
	       // split out tokens and trim
	       for(var i = 0; i < line.length; i++) {
	    	   
	    	   var tokens = SplitLine(line[i]);

	   	       if (tokens["0"].length > 0) {
	   	    	   
	   	    	   // add row to map
	   	    	   dataMap[i] = tokens;
	               
	               if (i > 0) {
	              	 	count++;
	              	 	totalCount++;
	               }
	            }	    	                
	       }    
	       if (count > 0) {
	    	   var data = {}
	    	   data['data'] = dataName;
	    	   data['count'] = count;	
	    	   data['encoding'] = encoding;	
	    	   out.UploadOutput('row', response, data)
	    	   
	   		   if (isLast) {
	   			  out.UploadOutput('end', response)
	   		   }	   		   
	    	   db.AddRawData(dataName, dataMap, count, totalCount);
	       }

	    });
	   
	  }
	  catch (err) {
		  console.log(err);
   	      var data = {}
	      data['data'] = dataName;
	      data['encoding'] = encoding;	
	      data['count'] = 'ERROR';	   
	      out.UploadOutput('row', response, data)
	      
   		   if (isLast) {
	   			out.UploadOutput('end', response)
   		   }   		   
	  }
}

function Index(response)
{
	console.log("Request handler 'index' was called.");
	
	// get our table names list (the things to import)
	var list = dataKnowledge.GetGraphedTableNames();
	var last = '';
	for (var i in list) {
		last = list[i];
	}
		
	out.UploadOutput('init', response);	
	for (var i in list) {
		var isLast = false; 
		if (list[i] == last) {
			isLast = true;
		}					
		IndexData(list[i], response, isLast)
	}		
}

function IndexData(dataName, response, isLast) {
	  console.log("indexData was called with " + dataName);

	  try
	  {
	    var count = 0;

	       
	    var data = {}
	    data['data'] = dataName;
	    data['count'] = count;	    	   
	    out.UploadOutput('row', response, data)
	    	   
	   	if (isLast) {
	   	  out.UploadOutput('end', response)
	   	}	   		   
	    db.IndexData(dataName);

	   
	  }
	  catch (err) {
		  console.log(err);
 	      var data = {}
	      data['data'] = dataName;
	      data['count'] = 'ERROR';	   
	      out.UploadOutput('row', response, data)
	      
 		   if (isLast) {
	   			out.UploadOutput('end', response)
 		   }   		   
	  }
}



// helper func to split out the comma separated values
function SplitLine(line)
{
    var tokens = line.split(',');

    var values = {}
    
    for (var i = 0; i < tokens.length; i++)	{    	
    	values[i.toString()] = trim(tokens[i]);
    }    
    return values;
}

/// remove any preceding/trailing whitespace
function trim(str) {
    str = str.toString();
    var begin = 0;
    var end = str.length - 1;
    while (begin <= end && str.charCodeAt(begin) < 33) { ++begin; }
    while (end > begin && str.charCodeAt(end) < 33) { --end; }
    return str.substr(begin, end - begin + 1);
}




exports.Upload = Upload;
exports.Index = Index;

