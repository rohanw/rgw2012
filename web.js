

var http = require('http');


http.createServer(function (req, res) {
  setTimeout(function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World');
  }, 2000);
}).listen(8000);

var server = require('node-router').getServer();

//Configure our HTTP server to respond with Hello World the root request
server.get("/ping", function (request, response) {
response.simpleText(200, "ping!");
});


console.log('Server running at http://127.0.0.1:8000/');


/*
var express = require('express'),
	http = require('http'),
	path = require("path"),  
	fs = require("fs");

http.createServer(function(request, response) {
	checkFile(request, response);
}).listen();



function checkFile(request, response)
{
	
	// return the contents
	response.writeHead(200, {
		'Content-Type'   : 'text/plain',
		'Access-Control-Allow-Origin' : '*'
	});

	// return response
	response.write('he.llo', 'utf8');
	response.end();	
}
*/

/*
app.get('/ping', function(request, response) {
  response.send('Ping!<br />');
});

app.get('/upRef', function(request, response) {

	
	load_static_file('Referral.csv', response);
	
	
});

app.get('/', function(request, response) {
	var responseString = '<html><head><title>PING!</title></head><body>Message was received!</body></html>'
	  response.send(responseString);
	});

*/


/*
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});


function load_static_file(uri, response) {  
    var filename = path.join(process.cwd(), uri);  
    if (!fs.exists(filename)) {  

            response.send("404 Not Found\n");  

            return;  
        }  
    else	{
             
            response.send('File exists!');  

    }  
}  

*/