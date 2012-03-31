var fs = require('fs');
var url = require('url');
var jade = require('jade');

var querystring = require('querystring');
var util = require('util');
var room = require('./room.js');

// todo - remove once multiple rooms are supported.

room.initialize();

function post_to_json(request, callback) {
    var postData = '';

    request.addListener("data", function (postDataChunk) {
			    postData += postDataChunk;
			});

    request.addListener("end", function() {
			    callback(JSON.parse(postData));
			});
}

function init(request, response) {
    // console.log("Request handler 'init' was called.");
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('./client/index.jade',
		function (err, data) {
		    if (err) {
			throw err;
		    }
		    var colors = room.get_colors();
		    var html_gen = jade.compile(data);
		    response.write(html_gen({
						'colors': colors
					    }));
		    response.end();
		});
}

function join(request, response) {
    // console.log("Request handler 'join' was called.");
    if (request.method == 'POST') {
	console.log("[200] " + request.method + " to " + request.url);
	post_to_json(request, function(data) {
			 response.writeHead(200, {'Content-Type': 'text/json'});
			 response.write(JSON.stringify(data));
			 response.end('\n');
	});
    }
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
		    else if (file_ext == 'css') {
			response.writeHead(200, {"Content-Type": "text/css"});
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

exports.init = init;
exports.join = join;
exports.update = update;
exports.files = files;