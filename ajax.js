
var url = require('url'),
    out = require("./output"),
    db = require("./database");


function Request(response, request) {
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	
    var data = {}
    data['dataName'] = query['action'];
    
    var session =  query['session'];

    console.log('ajax request: ' + request.url);
    
    // start HTML creation
	out.AjaxTableOutput('init', response, data);
	
	// get list of data from database
	db.GetAjaxList(query['action'], response, session, FinishList);	
	
}

//List retrieved from database, output to HTML and send to client
function FinishList(dataName, response, session, dataList)
{
	
	var odd = 0;
	for (var dataEntry in dataList) {
		var data = {}
		// the row id	
		data['data'] = dataList[dataEntry];
		// the table name
		data['dataName'] = dataName;
		// alternate row colours
		data['odd'] = odd;
		
		data['session'] = session;
		// pump out the html
		out.AjaxTableOutput('row', response, data)
		
		// ternary op? TODO
		if (odd == 0) {
			odd = 1
		}
		else {
			odd = 0;
		}
	}
	// send to client
	out.ListOutput('endajax', response);	
}



exports.Request = Request;