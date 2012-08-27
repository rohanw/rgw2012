function loadXMLDoc(name, session)
{
  var xmlhttp;

	document.getElementById(name).innerHTML="Loading...";

  if (window.XMLHttpRequest)
  { 
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange=function()
  {
     if (xmlhttp.readyState==4 && xmlhttp.status==200)
     {
	  clearTimeout(xmlHttpTimeout); 
       document.getElementById(name).innerHTML=xmlhttp.responseText;
     }
  }
  var command = "ajax?action=" + name + "&session=" + session;
  xmlhttp.open("GET",command,true);
  xmlhttp.send();

  // Timeout to abort in 10 seconds
  var xmlHttpTimeout=setTimeout(ajaxTimeout,10000);
  function ajaxTimeout(){
     xmlhttp.abort();
	document.getElementById(name).innerHTML="Request failed";
  }
}



window.onload=function(){	

	loadXMLDoc('wealthy', document.getElementById('session').value);
	loadXMLDoc('highincome', document.getElementById('session').value);
}