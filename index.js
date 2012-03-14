var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = {};
handlers[""] = requestHandlers.start;
handlers["join"] = requestHandlers.join;
handlers["update"] = requestHandlers.update;
handlers["files"] = requestHandlers.files;

server.start(router.route, handlers);