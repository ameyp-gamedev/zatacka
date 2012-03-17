var http = require("http");

function start(route, handlers) {
    function onRequest(request, response) {
	route(handlers, request, response);
    }

    http.createServer(onRequest).listen(8888);
    console.log("Server has started");
}

exports.start = start;