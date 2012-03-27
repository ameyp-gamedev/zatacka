var player = require('./player.js');
var MAX_PLAYERS = 5;
var room_name = "test01";

var players;
var colors;

Array.prototype.erase = function(name, property) {
    var i = -1;

    if (this[0].hasOwnProperty(property)) {
	var value = null;

	for (i = 0; i < this.length; i += 1) {
	    if (typeof(this[i].property == 'function'))
		value = this[i].property();
	    else
		value = this[i].property;

	    if ( (this[i].hasOwnProperty(property)) && (name == value) )
		break;
	}
    }
    else
	i = this.indexOf(name);

    // Element was not found
    if ( (i == -1) || (i == this.length) ) {
	return false;
    }

    while (i < this.length - 1) {
	this[i] = this[i+1];
	i += 1;
    }
    this.pop();

    return true;
};

function initialize() {
    players = new Array();
    colors = ["RED", "BLUE", "GREEN", "BLACK", "YELLOW"];

    players.add = function (new_player) {
	for (var i = 0; i < players.length; i++) {
	    if (players[i].get_color() == new_player.get_color()) {
		return false;
	    }
	}

	for (i = 0; i < players.length; i++) {
	    if (players[i] == null) {
		players[i] = new_player;

		colors.erase(new_player.get_color());

		return true;
	    }
	}

	return false;
    };

    players.remove = function (id) {
	for (var i = 0; i < players.length; i++) {
	    if (players[i].get_id() == id) {
		colors.push(players[i].get_color());

		for (var j = i; j < players.length-1; j += 1) {
		    players[j] = players[j+1];
		}
		players.pop();

		return;
	    }
	}
    };

    players.next_id = function () {
	if (players.length < MAX_PLAYERS)
	    return room_name + "_" + players.length;
	else
	    return -1;
    };
}

// returns valid id if joining was successful
// otherwise returns -1
function join(name, color) {
    var next_id = players.next_id();
    if (next_id != -1) {
	players.add(player.Player(next_id, name, color));
    }

    return next_id;
}

function leave(id) {
    players.remove(id);
}

exports.join = join;
exports.leave = leave;