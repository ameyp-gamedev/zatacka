function Player(params) {
    var linearVelocity = 100.0;
    var angularVelocity = 0.1;

    var left = false;
    var right = false;
    var alive = true;

    var pos = {
	x: Math.random()*700,
	y: Math.random()*500
    };
    var rot = Math.PI*Math.random();

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

	return [oldPos, pos];
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
	    deltaX = from.x - to.x;
	    origin.x = from.x;
	}
	else {
	    deltaX = to.x - from.x;
	    origin.x = from.x - 2;
	}
	if (from.y > to.y) {
	    deltaY = from.y - to.y;
	    origin.y = from.y;
	}
	else {
	    deltaY = to.y - from.y;
	    origin.y = from.y - 2;
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
	update_and_collide: update_and_collide,
	processInput: processInput
    };
}
