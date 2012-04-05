function Player(id, name, color) {
    var deltas = {};
    var alive = true;

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
	    for (var delta in delta_list) {
		deltas[color].push(delta);
		count += 1;
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
	}
    };
}

exports.Player = Player;