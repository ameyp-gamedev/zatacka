var player = require('./player.js');
var MAX_PLAYERS = 5;
var room_name = "test01";

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

	for (var item in players) {
	    if (players[item].hasOwnProperty('get_color') &&
		players[item].get_color() === color) {
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
	for (var item in players) {
	    if (players[item] === null &&
		item.search(room_name) !== -1) {
		return item;
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

exports.join = join;
exports.leave = leave;
exports.initialize = initialize;
exports.get_colors = get_colors;