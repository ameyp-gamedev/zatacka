var fs = require('fs');
var url = require('url');

function start(request, response) {
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

function join(request, response) {
    console.log("Request handler 'pause' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Paused");
    response.end();
}

function update(request, response) {
    console.log("Request handler 'update' was called.");
}

function files(request, response) {
    // var pathname = url.parse(request.url).pathname;
    var filepath = _getFilePath(url.parse(request.url).pathname);
    var file_ext = _getFileExtension(filepath);

    fs.readFile('./client/' + filepath, function (error, data) {
		    if (error) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 file not found");
			throw error;
		    }

		    if (file_ext == 'js') {
			response.writeHead(200, {"Content-Type": "application/javascript"});
		    }
		    else {
			response.writeHead(200, {"Content-Type": "text/plain"});
		    }
		    response.write(data);
		    response.end();
		});
}

function _getFilePath(pathname) {
    return pathname.split('/').slice(2).join('/');
}

function _getFileExtension(filepath) {
    var components = filepath.split('/');
    var filename = components[components.length - 1];
    return filename.split('.')[1];
}

exports.start = start;
exports.join = join;
exports.update = update;
exports.files = files;