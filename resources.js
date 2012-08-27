
var url = require('url'),
path = require("path"),
fs = require("fs");


function Get(response, request) {
	var pathname = url.parse(request.url).pathname;

	var filename = path.join(process.cwd(), pathname);
		
    var extname = path.extname(filename);
    var contentType = 'text/html';
    var encoding = 'utf-8';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.gif':
            contentType = 'image/GIF';
            encoding = 'binary';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            encoding = 'binary';
            break;            
        case '.jpg':
        case '.jpeg':
            contentType = 'image/JPEG';
            encoding = 'binary';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
        
    fs.exists(filename, function(exists) {

        if (exists) {
            
            fs.readFile(filename, function(error, content) {
                if (error) {                   
                    response.writeHead(500);
                    response.end();
                }
                else {      
                	console.log("Sending: " + filename + ", content: " + contentType + "encoding: " + encoding)
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, encoding);
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });	
}

exports.Get = Get;
