var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = {};
handlers[""] = requestHandlers.init;
handlers["join"] = requestHandlers.join;
handlers["update"] = requestHandlers.update;
handlers["files"] = requestHandlers.files;
handlers["getColors"] = requestHandlers.getColors;

server.start(router.route, handlers);