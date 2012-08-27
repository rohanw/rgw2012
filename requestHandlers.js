
var path = require("path"),  
	fs = require("fs"),
    db = require("./database"),
    uploader = require("./upload"),
    lister = require("./list"),
    detail = require("./detail"),
    home = require("./home"),
    ajax = require("./ajax"),
    resourceServer = require("./resources");
var exec = require("child_process").exec;


function Start(response, request) {
  console.log("Request handler 'start' was called.");
  
  home.Load(response, request);  
}

function Logon(response) {
	  console.log("Request handler 'logon' was called.");
	  
	  home.Logon(response);  
}

function Logoff(response, request) {
	  console.log("Request handler 'logoff' was called.");
	  
	  home.Logoff(response, request);  
}

function Authenticate(response, request) {
	  console.log("Request handler 'authenticate' was called.");
	  
	  home.Authenticate(response, request);  
}

function InitData(response)
{
	  console.log("Request handler 'initData' was called.");	
	
	  try
	  {		  
		  db.CreateRoot();
		  
		  response.writeHead(200, {"Content-Type": "text/plain"});
		  response.write("Data Initialized");
		  response.end();

	  }
	  catch (err) {
		  ServerError(err, response);  
	  }
	  
}

function ClearData(response)
{
	  console.log("Request handler 'clearData' was called.");	
	
	  try
	  {		  
		  db.ClearDatabase();
		  
		  response.writeHead(200, {"Content-Type": "text/plain"});
		  response.write("Data Cleared");
		  response.end();

	  }
	  catch (err) {
		  ServerError(err, response);	  
	  }	  
}

function Upload(response)
{
	uploader.Upload(response);

}

function List(response, request)
{
	lister.List(request, response);
}

function Search(response, request)
{
	lister.Search(request, response);
}

function Detail(response, request)
{
	detail.Detail(request, response);
}


function Find(response)
{
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Find Data Launched OK");
	response.end();
	  
	console.log("Request handler 'find' was called.");	
	db.FindNodes();	
}

function ServerError(err, response)
{
    console.log(err);
    
    response.writeHead(500, {"Content-Type": "text/plain"});
    response.write("Server error");
    response.end();	  
	
}

function Get(response, request) 
{
	resourceServer.Get(response, request);	
}

function AjaxRequest(response, request) {
	ajax.Request(response, request);
}


exports.Start = Start;
exports.Logon = Logon;
exports.Logoff = Logoff;
exports.Authenticate = Authenticate;
exports.Upload = Upload;
exports.ClearData = ClearData;
exports.InitData = InitData;
exports.Find = Find;
exports.List = List;
exports.Search = Search;
exports.Detail = Detail;
exports.Get = Get;
exports.AjaxRequest = AjaxRequest;
