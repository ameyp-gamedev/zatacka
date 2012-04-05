function Player(id, name, color) {
    var deltas = [];
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
	push_deltas: function (delta_list) {
	    for (var delta in delta_list) {
		deltas.push(delta);
	    }
	    return deltas.length;
	},
	pop_deltas: function () {
	    var res = [];
	    while (deltas.length > 0) {
		res.push(deltas.pop());
	    }
	    return res;
	}
    };
}

exports.Player = Player;