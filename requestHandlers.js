var fs = require('fs');

function start(response) {
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

function join(response) {
    console.log("Request handler 'pause' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Paused");
    response.end();
}

function update(response) {
}

exports.start = start;
exports.join = join;
exports.update = update;