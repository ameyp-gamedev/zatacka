function start(response) {
    console.log("Request handler 'start' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Started");
    response.end();
}

function pause(response) {
    console.log("Request handler 'pause' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Paused");
    response.end();
}

exports.start = start;
exports.pause = pause;