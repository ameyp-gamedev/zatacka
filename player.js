function Player(id, name, color) {
    var deltas = {};
    var alive = true;
    var points = [];
    var lerps = [];

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
	push_deltas: function (delta_list, color) {
	    var count = 0;
	    deltas[color] = [];
	    for (var index in delta_list) {
		if (typeof(delta_list[index] == 'number')) {
		    deltas[color].push(delta_list[index]);
		    count += 1;
		}
	    }
	    return count;
	},
	pop_deltas: function () {
	    var res = deltas;
	    deltas = {};
	    return res;
	},
	kill: function () {
	    alive = false;
	},
	is_alive: function () {
	    return alive;
	},
	last_position: {
	    x: -1,
	    y: -1
	},
	add_points: function (data) {
	    points.push(data);
	},
	add_lerps: function (data) {
	    lerps.push(data);
	},
	to_string: function () {
	    var history = "";
	    for (var i = 0; i < points.length - 1; i += 1) {
		history = history
		    + "\n [" + points[i][0].x + "," + points[i][0].y + "]"
		    + " -> [" + points[i+1][0].x + "," + points[i+1][0].y + "] = ";
		for (var j = 0; j < lerps[i+1].length; j += 1) {
		    history = history
			+ (j > 0 ? " -> " : "") + "[" + lerps[i+1][j].x + "," + lerps[i+1][j].y + "]";
		}
	    }
	    var output = ""
	     + "\n Name: " + name
	     + "\n Color: " + color
	     + "\n ID: " + id
	     + "\n Alive: " + alive
	     + "\n History: " + history;
	    return output;
	}
    };
}

exports.Player = Player;