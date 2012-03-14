var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handler = {};
handler["/"] = requestHandlers.start;
handler["/join"] = requestHandlers.join;
handler["/update"] = requestHandlers.update;

server.start(router.route, handler);