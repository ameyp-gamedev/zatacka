function Player(id, name, color) {
    var deltas = {};
    var positions = [];

    return {
	get_name: function () {
	    return name;
	},
	get_color: function () {
	    return color;
	},
	get_id: function () {
	    return id;
	},
	add_position: function (data) {
	    positions.push(data);
	},
	last_position: function (data) {
	    if (positions.length > 0) {
		return positions[positions.length - 1];
	    }
	    return {
		x: -1,
		y: -1
	    };
	},
	to_string: function () {
	    var history = "";
	    for (var i = 0; i < positions.length - 1; i += 1) {
		history = history
		    + "\n [" + positions[i][0].x + "," + positions[i][0].y + "]"
		    + " -> [" + positions[i+1][0].x + "," + positions[i+1][0].y + "]";
		}
	    var output = ""
	     + "\n Name: " + name
	     + "\n Color: " + color
	     + "\n ID: " + id
	     + "\n History: " + history;
	    return output;
	}
    };
}

exports.Player = Player;