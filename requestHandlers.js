var fs = require('fs');

function start(arguments, response) {
    console.log("Request handler 'start' was called.");
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('./client/index.html', function (err, data) {
		    if (err) {
			throw err;
		    }
		    response.write(data);
		    response.end();
		});
}

function join(arguments, response) {
    console.log("Request handler 'pause' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Paused");
    response.end();
}

function update(arguments, response) {
    console.log("Request handler 'update' was called.");
}

function files(arguments, response) {
    console.log("Request handler 'files' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    fs.readFile('./client/' + arguments[0], function (error, data) {
		    if (error) throw error;

		    response.write(data);
		    response.end();
		});
}

exports.start = start;
exports.join = join;
exports.update = update;
exports.files = files;