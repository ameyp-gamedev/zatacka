var url = require('url');

function route(handlers, request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("About to route a request for " + pathname);

    var components = pathname.split('/');
    if (components.length < 2) {
	console.log("Invalid pathname received " + pathname);
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("404 invalid path");
	response.end();
	return;
    }

    var root = components.slice(1, 2);
    var arguments = [];
    if (components.length > 2)
	arguments = components.slice(2);

    if (typeof handlers[root] == 'function') {
	handlers[root](request, response);
    }
    else {
	console.log("No request handler found for " + pathname);
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("404 Not found");
	response.end();
    }
}

exports.route = route;
