function Player(params) {
    var linearVelocity = 100.0;
    var angularVelocity = 0.1;
    var glitchTime = 300;
    var normalTime = 10000;

    var left = false;
    var right = false;
    var alive = true;

    var should_draw = true;

    var pos = {
	x: Math.random()*700,
	y: Math.random()*500
    };
    var rot = Math.PI*Math.random();

    var start = function() {
	setTimeout(glitch, normalTime*Math.random());
    };

    var glitch = function() {
	var timeout = glitchTime*Math.random();
	if (timeout < 100) {
	    timeout = 100;
	}

	should_draw = false;
	setTimeout(restore, timeout);
    };

    var restore = function() {
	var timeout = normalTime*Math.random();
	if (timeout < 3000) {
	    timeout = 3000;
	}
	else if (timeout > 6000) {
	    timeout = 6000;
	}
	should_draw = true;
	setTimeout(glitch, timeout);
    };

    var update_and_collide = function (context) {
	var nextPos = {};
	var oldPos = {};

	if ( left && !right ) {
	    rot -= angularVelocity;
	}
	else if ( !left && right) {
	    rot += angularVelocity;
	}

	nextPos = {
	    x : pos.x + Math.cos(rot)*linearVelocity*params.deltaTime/1000,
	    y : pos.y + Math.sin(rot)*linearVelocity*params.deltaTime/1000
	};

	collide(context, pos, nextPos);

	oldPos = pos;
	pos = nextPos;

	if (should_draw) {
	    return [oldPos, pos];
	}
	else {
	    return [];
	}
    };

    var collide = function(context, from, to) {
	var deltaX = 0,
            deltaY = 0,
            origin = {},
            collisionBox,
            i;

	if (from.x < 0 ||
	    from.x > context.canvas.width ||
	    from.y < 0 ||
	    from.y > context.canvas.height) {
	    alive = false;
	    return;
	}

	if (from.x > to.x) {
	    // moving left
	    deltaX = from.x - to.x;
	    origin.x = to.x - 2;
	}
	else {
	    // moving right
	    deltaX = to.x - from.x;
	    origin.x = to.x;
	}
	if (from.y > to.y) {
	    // moving up
	    deltaY = from.y - to.y;
	    origin.y = to.y - 2;
	}
	else {
	    // moving down
	    deltaY = to.y - from.y;
	    origin.y = to.y;
	}

	collisionBox = context.getImageData(origin.x, origin.y, deltaX, deltaY).data;

	for (i = 0; i < collisionBox.length; i += 1) {
	    if (collisionBox[i] !== 0) {
		alive = false;
		break;
	    }
	}

	// console.log("Checking for collision from [" + from.x + "," + from.y + "] to [" + to.x + "," + to.y + "] in " + JSON.stringify(collisionBox.data));
    };

    var processInput = function(code, down) {
	if (down) {
	    if (code === params.leftCode && left === false) {
		left = true;
	    }
	    else if (code === params.rightCode && right === false) {
		right = true;
	    }
	}
	else {
	    if (code === params.leftCode && left === true) {
		left = false;
	    }
	    else if (code === params.rightCode && right === true) {
		right = false;
	    }
	}
    };

    var get_color = function() {
	return params.color;
    };

    var kill = function() {
	alive = false;
    };
    var is_alive = function() {
	return alive;
    };

    return {
	get_color: get_color,
	is_alive: is_alive,
	kill: kill,

	start: start,
	update_and_collide: update_and_collide,
	processInput: processInput
    };
}
