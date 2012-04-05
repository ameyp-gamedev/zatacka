var player = require('./player.js');
var bit_array = require('bit-array');
var MAX_PLAYERS = 5;
var room_name = "test01";

var WIDTH = 800;
var HEIGHT = 600;

var pixelArray = new bit_array;

var players;
var colors;

Array.prototype.erase = function(name, property) {
    var i = -1;

    if (property != null) {
	for (i = 0; i < this.length; i += 1) {
	    if ( (typeof(this[i][property]) == 'function') &&
		(name == this[i][property]()) ) {
		return this.splice(i, 1)[0];
	    }
	    else if (name == this[i][property]) {
		return this.splice(i, 1)[0];
	    }
	}
    }
    else {
	i = this.indexOf(name);
	if (i != -1) {
	    return this.splice(i, 1)[0];
	}
    }

    return null;
};

var initialize = function () {
    players = {
	length: 0
    };
    colors = ["RED", "BLUE", "GREEN", "BLACK", "YELLOW"];

    players.add = function (name, color) {
	console.log("Name = " + name + ", Color = " + color);
	var next_id = players.next_id();
	if (next_id === -1) {
	    return -1;
	}

	for (var index in players) {
	    if (players[index].hasOwnProperty('get_color') &&
		players[index].get_color() === color) {
		return -1;
	    }
	}

	players[next_id] = player.Player(next_id, name, color);
	players.length += 1;
	colors.erase(color);

	return next_id;
    };

    players.remove = function (id) {
	if (players[id].hasOwnProperty('get_color')) {
	    colors.push(players[id].get_color());
	    players[id] = null;
	    players.length -= 1;
	}
    };

    players.next_id = function () {
	for (var index in players) {
	    if (players[index] === null &&
		index.search(room_name) !== -1) {
		return index;
	    }
	}

	if (players.length < MAX_PLAYERS)
	    return room_name + "_" + players.length;
	else
	    return -1;
    };
};

// returns valid id if joining was successful, otherwise -1
var join = function (name, color) {
    return players.add(name, color);
};

var leave = function (id) {
    players.remove(id);
};

var get_colors = function() {
    return colors;
};

var isPlayerAlive = function (id) {
    return (players[id] !== null
	    ? players[id].is_alive()
	    : false);
};

var getBitPosition = function (x, y) {
    return (WIDTH*y + x);
};

var getVector = function(bit) {
    var x = bit % WIDTH;
    var y = bit / WIDTH;
    return {
	x: x,
	y: y
    };
};

var calculateCollisions = function (id, points) {
    var i = 0;
    var bitPos = 0;
    var deltas = [];

    // check for out-of-bounds first
    var finalPos = points[points.length - 1];
    if (finalPos.x < 0 ||
	finalPos.x > WIDTH ||
	finalPos.y < 0 ||
	finalPos.y > HEIGHT) {
	if (players[id] !== null) {
	    players[id].kill();
	}
    }

    // check for actual collisions next
    for (i = 0; i < points.length; i += 1) {
	bitPos = getBitPosition(points[i]);
	if (pixelArray.get(bitPos) === true) {
	    if (players[id] !== null) {
		players[id].kill();
	    }
	    console.log("Player " + id + " collided");
	    break;
	}
	pixelArray.set(bitPos, true);
	deltas.push(bitPos);
    }

    return deltas;
};

var mapPlayerDeltas = function (id, deltas) {
    if (players[id] === null) {
	return;
    }

    for (var index in players) {
	if (players[index] !== null &&
	    players[index].hasOwnProperty('get_id')) {
	        players[index].push_deltas(deltas, players[id].get_color());
	}
    }
};

var getPlayerPositions = function (id) {
    var coloredDeltas = (players[id] !== null
			 ? players[id].pop_deltas()
			 : []);
    var positions = [];

    for (var color in coloredDeltas) {
	var deltas = coloredDeltas[color];
	positions[color] = [];
	for (var delta in deltas) {
	    positions[color].push(getVector(delta));
	}
    }

    return positions;
};

exports.join = join;
exports.leave = leave;
exports.initialize = initialize;
exports.get_colors = get_colors;
exports.calculateCollisions = calculateCollisions;
exports.mapPlayerDeltas = mapPlayerDeltas;
exports.getPlayerPositions = getPlayerPositions;
exports.isPlayerAlive = isPlayerAlive;