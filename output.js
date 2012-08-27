var fs = require("fs"),
	path = require("path");
var dataKnowledge = require("./dataKnowledge");

// consts
var baseAddress = 'http://localhost:8888/';


function HomeOutput(action, response, data, output) {
	switch (action) {
	case 'home':
		// build the homepage from the template
		var name = data['name'];
		var sessionId = data['session'];
		output = GetTemplate();
		output = output.replace("%PAGE-TITLE%", "Welcome to the future")
			.replace("%META-KEYWORDS%", MetaKeyWords())
			.replace("%META-DESCRIPTION%", MetaDescription())
			.replace("<!--%PAGE-HEADING%-->", "Welcome " + name)
			.replace("<!--%HEAD-CONTENT%-->", CSSRef() + AjaxControlScript())
			.replace("<!--%SESSIONID%-->", SessionHtml(sessionId))
			.replace("<!--%LOGOFF%-->", "<a href='" + baseAddress + "logoff?session=" + sessionId + "'>Logoff</a>")
			.replace("<!--%MAIN-MENU-CONTENT%-->", GetMainMenu());
		
		var list = dataKnowledge.GetBrowsableTables();
		var content = '<div id="navPanel"><b>Browse Data</b><br />\n';
		for (var table in list) {
			content += "<a href='" + baseAddress + "list?node=" + list[table] + "&session=" + sessionId + "'>" + list[table] + "</a><br />\n";
		}
		var message = "\'Do you want to import data?\\n\\nWarning: Existing data may be overwritten!\'";
		content += '<br /><b>Data Admin</b><br />\n<a href="' + baseAddress + 'upload" onclick="return confirm(' + message + ');">Upload Data</a><br />\n';
		content += SearchForm(sessionId);
		content += '</div><div id="dataPanel">';
		content += HomepageWealthyIndividualControl(sessionId);
		content += HomepageHighIncomeIndividualControl(sessionId);
		content += '<br /></div>';
		output = output.replace("<!--%MAIN-CONTENT%-->", content);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(output);
		response.end();					
		return;
	case 'logon':
	case 'logoff':
		output = GetLogon();
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
		return;
	case 'error':
		output = Error500(data);
		response.writeHead(500, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
		return;		 	
	default:
		return output;
	}	
}

// format the upload functions HTML response
//  provides links for each datagroup loaded
function UploadOutput(action, response, data) {	
	
	if (action == 'init') {
		response.writeHead(200, {"Content-Type": "text/html"});
		var today = new Date();
		var output = DOCTYPE() + HTML() + "<head>\n" + CSSRef() + "<title>Data Upload Facility</title>\n</head>\n<body>\n" + H1("Data Upload in Progress") + 
		H2("Started: " + today) + "<table border='1'>\n<tr>\n<th width='250px'>Data</th>\n<th>Encoding</th>\n<th>Records</th>\n</tr>\n";
		response.write(output);
	}
	else if (action == 'row') {
		var output = TR() + TD() + data['data'] + "</td>\n" + TD() + 
		data['encoding'] + "</td>\n" + TDR() + data['count'] + "</td>\n</tr>\n";
		response.write(output);
	} 
	else if (action == 'end') {
		var tail = "</table>\n<br /><br /><h2>Urgh! WORK, go and make a cup of coffee, I might be a while...</h2></body>\n</html>\n";	   			   
		response.write(tail);
		response.end();
	} 	
}


//format the lister functions HTML response
//provides links for each datagroup loaded
function ListOutput(action, response, data, output) {

	if (action == 'init') {
		var sessionId = data['session'];
		output = GetTemplate();
		output = output.replace("%PAGE-TITLE%", "Data Listing")
			.replace("%META-KEYWORDS%", MetaKeyWords())
			.replace("%META-DESCRIPTION%", MetaDescription())
			.replace("<!--%LOGOFF%-->", "<a href='" + baseAddress + "logoff?session=" + sessionId + "'>Logoff</a>")
			.replace("<!--%PAGE-HEADING%-->", "Data Listing")
			.replace("<!--%PAGE-SUBHEADING%-->", H2(data['dataName']))			
			.replace("<!--%HEAD-CONTENT%-->", CSSRef() + TableScript())
			.replace("<!--%PRECONTENT%-->", "<table class='altrowstable' ids='alternatecolor'><tr><th width='100px'>Record Id</th><th width='400px' align='left'>Description</th></tr>")
			.replace("<!--%PAGE-BREADCRUMB%-->", ListBreadCrumb(data['dataName'], sessionId))			
			.replace("<!--%MAIN-MENU-CONTENT%-->", GetMainMenu());
		return output;		
	}
	else if (action == 'searchinit') {		
		var sessionId = data['session'];
		output = GetTemplate();
		output = output.replace("%PAGE-TITLE%", "Client Search")
			.replace("%META-KEYWORDS%", MetaKeyWords())
			.replace("%META-DESCRIPTION%", MetaDescription())
			.replace("<!--%LOGOFF%-->", "<a href='" + baseAddress + "logoff?session=" + sessionId + "'>Logoff</a>")
			.replace("<!--%PAGE-HEADING%-->", "Client Search")
			.replace("<!--%PAGE-SUBHEADING%-->", "<h2>Searching: " + data['dataName'] + "</h2>")			
			.replace("<!--%HEAD-CONTENT%-->", CSSRef() + TableScript())
			.replace("<!--%PRECONTENT%-->", "<table class='altrowstable' id='alternatecolor'><tr><th width='100px'>Client Id</th><th width='300px' align='left'>Name</th>\n<th width='200px' align='left'>Type</th></tr>")
			.replace("<!--%PAGE-BREADCRUMB%-->", SearchBreadCrumb(data['dataName'], sessionId))			
			.replace("<!--%MAIN-MENU-CONTENT%-->", GetMainMenu());
	
		return output;
	}
	else if (action == 'row') {
		var dataLine = data['data'];
		var odd = data['odd'];
		var href = baseAddress + "detail?node=" + dataLine['NodeId'] + "&amp;type=" + data['dataName'] + "&amp;session=" + data['session'];
		output += TRL(href, odd) + TD() + dataLine['Id'] + "</td>" + TD() + dataLine['Name'] + "</td></tr>";
		return output;	
	} 
	else if (action == 'content') {
		output = output.replace("<!--%MAIN-CONTENT%-->", data + "</table>");
		return output;	
	} 	
	else if (action == 'searchrow') {
		var dataLine = data['data'];
		var odd = data['odd'];
		var href = baseAddress + "detail?node=" + dataLine['NodeId'] + "&amp;type=" + dataLine['dataName'] + "&amp;session=" + data['session'];
		output += TRL(href, odd) + TD() + dataLine['Id'] + "</td>" + TD() + dataLine['Name'] + "</td>" + TD() + dataLine['dataName'] + "</td></tr>";
		
		//output += TR_ALT(odd) + TD() + "<a href='" + baseAddress + "detail?node=" + dataLine['NodeId'] + 
		//"&amp;type=" + dataLine['dataName'] + "&amp;session=" + data['session'] + "'>" + dataLine['Id'] + "</a></td>" + TD() + dataLine['Name'] + "</td>\n" + TD() + dataLine['dataName'] + "</td></tr>";
		return output;
	} 	
	else if (action == 'end') {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
	} 	
	else if (action == 'endajax') {
		response.write("</table>");
		response.end();	
	} 	
	else if (action == 'error') {
		output = Error500(data);
		response.writeHead(500, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
		return;
	} 	
	return output;
}

//format the detail functions HTML response
//provides editable fields where applicable
function DetailOutput(action, response, data, output) {

	if (action == 'init') {
		output = GetTemplate();
		output = output.replace("%PAGE-TITLE%", "Data Detail")
			.replace("%META-KEYWORDS%", MetaKeyWords())
			.replace("%META-DESCRIPTION%", MetaDescription())
			.replace("<!--%LOGOFF%-->", "<a href='" + baseAddress + "logoff?session=" + data['session'] + "'>Logoff</a>")
			.replace("<!--%PAGE-HEADING%-->", data['dataName'] + " Detail")
			.replace("<!--%PAGE-SUBHEADING%-->", "<h2>" + data['dataName'] + "</h2>")			
			.replace("<!--%HEAD-CONTENT%-->", CSSRef() + TableScript())
			.replace("<!--%PRECONTENT%-->", "<table class='altrowstable' id='alternatecolor'><tr><th width='200px'>Property</th><th width='400px'>Value</th></tr>")
			.replace("<!--%PAGE-BREADCRUMB%-->", DetailBreadCrumb(data['dataName'], data['session']))			
			.replace("<!--%MAIN-MENU-CONTENT%-->", GetMainMenu());
		return output;			
	}
	else if (action == 'row') {
		output += TR() + TD() + data['data'] + "</td>" + TD() + data['desc'] + "</td></tr>";
		return output;
	} 
	else if (action == 'content') {
		output = output.replace("<!--%MAIN-CONTENT%-->", data + "</table>");
		return output;	
	} 	
	else if (action == 'end') {
		output += "</table></body>\n</html>\n";
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
	} 	
	else if (action == 'error') {
		output = Error500(data);
		response.writeHead(500, {"Content-Type": "text/html"});
		response.write(output);
		response.end();	
		return;
	} 		
}


function AjaxTableOutput(action, response, data) {

	switch (data['dataName']) {
		case 'wealthy':
			AjaxWealthyTableOutput(action, response, data);
			break;
		case 'highincome':
			AjaxHighIncomeTableOutput(action, response, data);
			break;			
	}
}


function AjaxWealthyTableOutput(action, response, data) {
	
	if (action == 'init') {
		var output = "<table class='altrowstable' id='alternatecolor'><tr><th colspan='3' width='300px'>Top 10 Stockholding Clients</th>\n</tr>\n<tr>\n<th width='300px'>Name</th><th width='200px' align='left'>Mobile</th>\n<th width='100px' align='right'>Stock</th></tr>";
		response.write(output);	
	}
	else if (action == 'row') {
		dataLine = data['data'];
		var odd = data['odd']
		var output = TR_ALT(odd) + TD() + "<a href='" + baseAddress + "detail?node=" + dataLine['NodeId'] + 
		"&amp;type=Individual&amp;session=" + data['session'] + "'>" + dataLine['Name'] + "</a></td>" + TD() + dataLine['Mobile'] + "</td>"  + TD() + dataLine['Total'] + "</td></tr>";		
		response.write(output);
	} 
	else if (action == 'end') {
		var tail = "</table>";	   			   
		response.write(tail);
		response.end();
	} 	
}

function AjaxHighIncomeTableOutput(action, response, data) {
	
	if (action == 'init') {
		var output = "<table class='altrowstable' id='alternatecolor'><tr><th colspan='3' width='300px'>Top 10 Income Clients</th>\n</tr>\n<tr>\n<th width='300px'>Name</th><th width='200px' align='left'>Mobile</th>\n<th width='100px' align='right'>Average Income</th></tr>";
		response.write(output);	
	}
	else if (action == 'row') {
		dataLine = data['data'];
		var odd = data['odd']
		var output = TR_ALT(odd) + TD() + "<a href='" + baseAddress + "detail?node=" + dataLine['NodeId'] + 
		"&amp;type=Individual&amp;session=" + data['session'] + "'>" + dataLine['Name'] + "</a></td>" + TD() + dataLine['Mobile'] + "</td>"  + TD() + dataLine['Total'] + "</td></tr>";		
		response.write(output);
	} 
	else if (action == 'end') {
		var tail = "</table>";	   			   
		response.write(tail);
		response.end();
	} 	
}

//-------------------------------------------------------------------------------------------------------------------------
//
// Breadcrumb injection
//
//-------------------------------------------------------------------------------------------------------------------------
function ListBreadCrumb(dataName, session) {
	return "<a href='" + baseAddress + "start?session=" + session + "'> Home </a>&gt; Browse " + dataName + "<br />"; 	
}

function SearchBreadCrumb(dataName, session) {
	return "<a href='" + baseAddress + "start?session=" + session + "'> Home </a>&gt; Client Search<br />"; 	
}

function DetailBreadCrumb(dataName, session) {
	return "<a href='" + baseAddress + "start?session=" + session + "'> Home </a>&gt; <a href='" + baseAddress + "list?node=" + dataName + "&session=" + session + "'> Browse " + dataName + " </a> &gt; " + dataName + "<br /><br />"; 	
}


//-------------------------------------------------------------------------------------------------------
//
//      FIXED HTML FORMATTING STUFF
//
//-------------------------------------------------------------------------------------------------------

function GetTemplate()
{
	try
	{
		var filename = path.join(process.cwd(), 'resources/template-main.txt');
		var data = fs.readFileSync(filename, 'ascii');
	 
		return data;
	}
	catch (err)
	{
		return 'error';
	}
}

function GetLogon()
{
	try
	{
		var filename = path.join(process.cwd(), 'resources/logon-main.txt');
		var data = fs.readFileSync(filename, 'ascii');
	 
		return data;
	}
	catch (err)
	{
		return 'error';
	}
}


function GetMainMenu()
{
	try
	{
		var filename = path.join(process.cwd(), 'resources/main-menu.txt');
		var data = fs.readFileSync(filename, 'ascii');
	 
		return data;
	}
	catch (err)
	{
		return '';
	}
}

// emit doctype dtd link
function DOCTYPE() {
	return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
}

function HTML() {
	return '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n';
}

function MetaKeyWords()
{
	return 'accounting,software,cloud,modern,new,money,debit,credit,tax,balances,'; 
}

function MetaDescription()
{
	return 'Your new online accounting practice is here, sure you can\'t do anything useful with it but hey, it\'s free!'; 
}

function CSSRef() {
	return '<link rel="styleSheet" type="text/css" href="' + baseAddress + 'resources/stylez.css" />\n';
}

function TableScript() {
   return '<script type="text/javascript" src="' + baseAddress + 'resources/table.js"></script>\n';
}

function AjaxControlScript() {
	   return '<script type="text/javascript" src="' + baseAddress + 'resources/ajaxcontrol.js"></script>\n';
}


function TR() {
	return '<tr>';  // onmouseover="this.style.backgroundColor=&#39;#ffff66&#39;;" onmouseout="this.style.backgroundColor=&#39;#ffffff&#39;;">\n';
}
function TR_ALT(odd) {
	if (odd == 0) {
		return '<tr class="oddrowcolor">';
	}
	else {
		return '<tr class="evenrowcolor">';		
	}
}
function TRL (href, odd) {
	if (odd == 1) {
	 return '<tr bgcolor="#dddddd" onclick="DoNav(\'' + href + '\');" onmouseover="this.style.backgroundColor=\'#ffffcc\';" onmouseout="this.style.backgroundColor=\'#dddddd\';">';
	}
	else {
		 return '<tr bgcolor="#eeeeee" onclick="DoNav(\'' + href + '\');" onmouseover="this.style.backgroundColor=\'#ffffcc\';" onmouseout="this.style.backgroundColor=\'#eeeeee\';">';	
	}
}
function TD() {
	return '<td>\n';
}
function TDR() {
	return '<td align="right">\n';
}

function H1(heading) 
{
	return "<h1>" + heading + "</h1>\n";
}

function H2(heading) 
{
	return "<h2>" + heading + "</h2>\n";
}

function SearchForm(session)
{
   return '<br />\n<b>Search Clients</b>\n<form name="input" action="' + baseAddress + 'search" method="get">\n<input type="text" name="search" />\n<input type="hidden" name="session" id="session" value="' + session + '" />\n<input type="submit" value="Search" />\n</form>\n';	
}

function HomepageWealthyIndividualControl(session) {
	   return '<br />\n<div id="wealthy">\n<table class="altrowstable" id="alternatecolor">\n<tr>\n<th width="580">Top 10 Stockholding Clients</th>\n<th width="20">\n<img src="resources/spinner.gif" alt="Loading - please wait..." />\n</th>\n</tr>\n</table>\n</div>\n<button type="button" onclick="loadXMLDoc(\'wealthy\', \'' + session + '\')">Refresh</button><br /><br />';
	
}
function HomepageHighIncomeIndividualControl(session) {
	   return '<br />\n<div id="highincome">\n<table class="altrowstable" id="alternatecolor">\n<tr>\n<th width="580">Top 10 Average Income Clients</th>\n<th width="20">\n<img src="resources/spinner.gif" alt="Loading - please wait..." />\n</th>\n</tr>\n</table>\n</div>\n<button type="button" onclick="loadXMLDoc(\'highincome\', \'' + session + '\')">Refresh</button><br /><br />';	
	
}

function SessionHtml(sessionId) {
	return "<input name='sessionid' type='hidden' value='" + sessionId + "'>";
}



function Error500(err)
{
	var output = DOCTYPE() + HTML() + "<head>\n" + CSSRef() + "<title>Data Upload Facility</title>\n</head>\n<body>\n<h1>500 Server Error</h1>\n";
	if (!(typeof err === "undefined")) {
		if (err != null) {
			output += H2(err);
		}
	}
	output += "</body></html>";
	return output;
}

exports.HomeOutput = HomeOutput;
exports.UploadOutput = UploadOutput;
exports.ListOutput = ListOutput;
exports.DetailOutput = DetailOutput;
exports.AjaxTableOutput = AjaxTableOutput;

