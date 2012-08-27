
var out = require("./output"),
	url = require('url'),
    db = require("./database"),
	session = require("./session");

// Load the homepage, this will have most of the functionality in it
function Load(response, request)
{
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
		data['session'] = session;
		
		db.GetSession(request, response, data, StartHome)		
	}
	catch (err)
	{
		out.HomeOutput('error', response, err);
	}
}

function StartHome(request, response, data, result, name)
{
	if (result) {
	
		data['name'] = name;
		out.HomeOutput('home', response, data); 
	}
	else {
		out.HomeOutput('logon', response);  
		return;		
	}
}

function Logon(response)
{
	try
	{	
		out.HomeOutput('logon', response);  
	}
	catch (err)
	{
		out.HomeOutput('error', response, err);
	}
}

function Logoff(response, request)
{
	try
	{	
		var url_parts = url.parse(request.url, true);
		var query = url_parts.query;
	
		var session = query['session'];
		
		db.KillSession(session);	
		
		out.HomeOutput('logoff', response);  
	}
	catch (err)
	{
		out.HomeOutput('error', response, err);
	}
}

function Authenticate(response, request)
{
	try
	{	
		
		var url_parts = url.parse(request.url, true);
		var query = url_parts.query;
	

		var user = query['username'];		
		var password = query['password'];
			
		if (user == null || user.length == 0) {
			out.HomeOutput('logon', response);  
			return;
		}
		
		session.SetSession(request, response, user, SetSessionComplete);

	}
	catch (err)
	{
		out.HomeOutput('error', response, err);
	}
}

function SetSessionComplete(request, response, result, data)
{
	console.log("Set Session completed: " + result)
	
	if (result) {
		out.HomeOutput('home', response, data); 
	}
	else {
		console.log(data);
		out.HomeOutput('logon', response);  
	}
		
}


exports.Load = Load;
exports.Logon = Logon;
exports.Logoff = Logoff;
exports.Authenticate = Authenticate;