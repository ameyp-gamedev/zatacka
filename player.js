function Player(id, name, color) {
    return {
	get_name: function () {
	    return name;
	},
	get_color: function () {
	    return color;
	},
	get_id: function () {
	    return id;
	}
    };
}

exports.Player = Player;