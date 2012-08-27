
var url = require('url'),
    out = require("./output"),
    db = require("./database");


// List a 'table's' contents
function List(request, response) {
	
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
		
		var data = {}
		data['dataName'] = query['node'];
		data['session'] = session;
		
		db.GetSession(request, response, data, StartList)
	}
	catch (err)
	{
		out.ListOutput('error', response, err);
	}
}

function StartList(request, response, data, result, name)
{
	if (result) {
		var session = data['session'];
		
		// get list of data from database	
		db.GetList(data['dataName'], response, session, FinishList);
	}
	else {
		out.HomeOutput('logon', response);  
		return;		
	}
}

// List retrieved from database, output to HTML and send to client
function FinishList(dataName, response, session, dataList)
{

	// something went wrong - 500 error
	if (dataName == 'error')
	{
		out.ListOutput('error', response);
		return;
	}
	
    // start HTML creation        
	var data = {}
	data['dataName'] = dataName;  
	data['session'] = session;
	var output = out.ListOutput('init', response, data, output);
	
	var odd = 0;
	var content = '';
	for (var dataEntry in dataList) {
	
		var data = {}
		data['session'] = session;
		data['data'] = dataList[dataEntry];
		data['odd'] = odd;
		// the table name
		data['dataName'] = dataName;

		// pump out the html
		content = out.ListOutput('row', response, data, content)
		
		odd = (odd == 0 ? 1 : 0 );
	}
	output = out.ListOutput('content', response, content, output)	
	// send to client
	out.ListOutput('end', response, null, output);	
}

//List a 'table's' contents
function Search(request, response) {
	
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	
	var session = query['session'];
	
	// check session 
	if (session == null || session.length == 0) {
		out.HomeOutput('logon', response);  
		return;
	}
	
    var data = {}
    data['dataName'] = query['search'];
	data['session'] = session;
	
	db.GetSession(request, response, data, StartSearch)    

		
}


function StartSearch(request, response, data, result, name)
{
	if (result) {
		var session = data['session'];	
		
		// get list of data from database
		db.GetSearch(data['dataName'], response, session, FinishSearch);				
		
	}
	else {
		out.HomeOutput('logon', response);  
		return;		
	}
}


// List retrieved from database, output to HTML and send to client
function FinishSearch(response, dataList, session, searchFor)
{
	// something went wrong - 500 error
	if (searchFor == 'error')
	{
		out.ListOutput('error', response);
		return;
	}	

    // start HTML creation
	var data = {}
	data['dataName'] = searchFor;	
	data['session'] = session;
	var output = out.ListOutput('searchinit', response, data, output);
	
	var odd = 0;
	var content = '';
	for (var dataEntry in dataList) {
		var data = {}
		// the row id	
		data['session'] = session;
		data['data'] = dataList[dataEntry];
		data['odd'] = odd;
		
		// pump out the html
		content = out.ListOutput('searchrow', response, data, content)

		// ternary op? TODO
		if (odd == 0) {
			odd = 1
		}
		else {
			odd = 0;
		}
	}
	output = out.ListOutput('content', response, content, output)	
	// send to client	
	out.ListOutput('end', response, null, output);	
}


exports.List = List;
exports.Search = Search;