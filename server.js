var http = require("http");

function start(route, handlers) {
    function onRequest(request, response) {
	route(handlers, request, response);
    }

    http.createServer(onRequest).listen(8080);
    console.log("Server has started");
}

exports.start = start;