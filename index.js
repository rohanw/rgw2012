var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.Start;
handle["/start"] = requestHandlers.Start;
handle["/logon"] = requestHandlers.Logon;
handle["/logoff"] = requestHandlers.Logoff;
handle["/authenticate"] = requestHandlers.Authenticate;
handle["/upload"] = requestHandlers.Upload;
handle["/initdata"] = requestHandlers.InitData;
handle["/cleardata"] = requestHandlers.ClearData;
handle["/find"] = requestHandlers.Find;
handle["/list"] = requestHandlers.List;
handle["/detail"] = requestHandlers.Detail;
handle["/resources"] = requestHandlers.Get;
handle["/search"] = requestHandlers.Search;
handle["/ajax"] = requestHandlers.AjaxRequest;

server.start(router.route, handle);