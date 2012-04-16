/* global setInterval, clearInterval, setTimeout, console, JSON, $, discretize */

// The canvas context
var context;
var players = new Array();
var linearVelocity = 100.0;
var angularVelocity = 0.1;
var deltaTime = 33; 		//milli-secs
var colorUpdateTime = 1000;

var last_positions = {};

// to de removed
var me;

var init = function () {
    initializeContext();
    initializeMe();
    updateColors();
    setInterval(updateColors, colorUpdateTime);
};

var initializeContext = function () {
    var canvas = document.getElementById('renderer');
    if (canvas.getContext('2d')) {
	console.log("Initialized the canvas context");
	context = canvas.getContext('2d');
	context.lineWidth = 2;
    }
    else {
	var box = document.getElementById('canvas');
	var message = document.createTextNode("You need a browser that supports Canvas to run this");
	box.appendChild(message);
    }
};

// todo move to server
var initializeMe = function () {
    // TODO make this a local variable and add it to players array for multiplayer
    me = {
	id: -1,
	position: {
	},
	rotation : Math.PI*Math.random(),
	left: false,
	right: false,
	alive: true,
	color: "",
	incomingPoints: [
	],
	debug: []
    };
    console.log("Initialized player (" + me.position.x + "," + me.position.y + ") with rotation " + me.rotation);
};

var initializePlayers = function(origins) {
    for (var i = 0; i < origins.length; i += 1) {
	last_positions[origins[i].color] = {
	    x: origins[i].position.x,
	    y: origins[i].position.y
	};
	if (me.color === origins[i].color) {
	    me.position = {
		x: origins[i].position.x,
		y: origins[i].position.y
	    };
	}
    }

    console.log("Initialized origins: " + JSON.stringify(last_positions));
};

var updateColors = function () {
    var jqxhr = $.post('getColors',
		       function (colors) {
			   var html = '';
			   var chosenColor = '';
			   $('.color').each(function(index) {
			       if ($(this).prop('checked') === true) {
				   chosenColor = $(this).prop('value');
				   return false; // breaks out of '.each'
			       }
			       return true;
			   });
			   for (var i = 0; i < colors.length; i += 1) {
			       html += "<input type=\"radio\""
				   + " name=\"color\""
				   + " class=\"color\""
				   + " value=\"" + colors[i] + "\""
				   + (chosenColor === colors[i] || chosenColor === ''
				      ? " checked"
				      : "")
				   + " />" + colors[i] + "<br />";
			   }
			   $('#colors').html(html);
		       });
    jqxhr.fail(function () {
	clearInterval(updateColors);
    });
};

// will be triggered from the server in multi
var startGame = function () {
    // console.log("startGame");
    setInterval(Tick, deltaTime);
    // post to server and get a blank response
};

var joinGame = function () {
    var request = {
    };
    $('.color').each(function(index) {
	if ($(this).prop('checked') === true) {
	    request.color = $(this).prop('value');
	    me.color = request.color;
	    return false;
	}
	return true;
    });
    request.name = $('#name').val();
    var jqxhr = $.post('join',
	   JSON.stringify(request),
	   function(data) {
	       console.log("success, response = " + JSON.stringify(data));
	       me.id = data.id;
	       initializePlayers(data.origins);
	       console.log("Received id: " + me.id);
	   },
		       'json');
    jqxhr.fail(function () {
	console.log("Failed to join game");
    });
};

var onKeyDown = function (event) {
    // console.log("KeyDown: " + event.keyCode);
    if ((event.keyCode == 37) && (me.left == false)) {
	me.left = true;
    }
    else if ((event.keyCode == 39) && (me.right == false)) {
	me.right = true;
    }
};

var onKeyUp = function (event) {
    // console.log("KeyUp: " + event.keyCode);
    if ((event.keyCode == 37) && (me.left == true)) {
	me.left = false;
    }
    else if ((event.keyCode == 39) && (me.right == true)) {
	me.right = false;
    }
};

var Tick = function () {
    // console.log("Tick");
    if (me.alive === true) {
	updatePosition();
	renderCanvas();
    }
    else {
	clearInterval(Tick);
    }
};

var updatePosition = function () {
    var nextPos = {};

    if ( (me.left == true) && (me.right == false) ) {
	// console.log("Turning left");
	me.rotation -= angularVelocity;
    }
    else if ( (me.left == false) && (me.right == true) ) {
	// console.log("Turning right");
	me.rotation += angularVelocity;
    }
    else {
	// console.log("Going straight");
    }

    nextPos = {
	x : me.position.x + Math.cos(me.rotation)*linearVelocity*deltaTime/1000,
	y : me.position.y + Math.sin(me.rotation)*linearVelocity*deltaTime/1000
    };

    drawAndCollide(me.position, nextPos);
    sendPosition();
    me.position.x = nextPos.x;
    me.position.y = nextPos.y;
};

var drawAndCollide = function(from, to) {
    var deltaX = 0,
	deltaY = 0,
	origin = {},
	collisionBox,
	i;

    if (from.x < 0 ||
	from.x > context.canvas.width ||
	from.y < 0 ||
	from.y > context.canvas.height) {
	me.alive = false;
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
	    me.alive = false;
	    break;
	}
    }

    // console.log("Checking for collision from [" + from.x + "," + from.y + "] to [" + to.x + "," + to.y + "] in " + JSON.stringify(collisionBox.data));
};

var sendPosition = function() {
    var request;

    var i = 0,
	prevPoint;

    request = {
	'id': me.id,
	'position': me.position
    };

    me.debug.push(me.position);
    // console.log("Sending position: " + JSON.stringify(request));

    var jqxhr = $.post('update', JSON.stringify(request), drawOthers, 'json');
    jqxhr.fail(function () {
	console.log("Failed to update positions");
	clearInterval(Tick);
    });
};

var drawOthers = function(response) {
    var coloredPositions = response.coloredPositions;
    var i = 0;

    console.log("Received response: " + JSON.stringify(response));

    // Add to queue for drawing
    for (i = 0; i < coloredPositions.length; i += 1) {
	if (coloredPositions[i].hasOwnProperty('color')) {
	    me.incomingPoints.push({
		color: coloredPositions[i].color,
		position: {
		    x: coloredPositions[i].position.x,
		    y: coloredPositions[i].position.y
		}
	    });
	}
    }

    if (me.alive === false) {
	console.log(JSON.stringify(me.debug));
    }
};

var renderCanvas = function () {
    var i = 0;
    var color;
    var currentPoint = null,
	nextPoint = null;

    for (i = 0; i < me.incomingPoints.length; i += 1) {
	color = me.incomingPoints[i].color;
	currentPoint = last_positions[color];
	nextPoint = me.incomingPoints[i].position;
	drawLine(currentPoint, nextPoint, color);
	last_positions[me.incomingPoints[i].color] = me.incomingPoints[i].position;
    }

    me.incomingPoints = [];
};

var drawLine = function (from, to, color) {
    // console.log("Drawing line from [" + from.x + "," + from.y + "] to [" + to.x + "," + to.y + "]");
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
};