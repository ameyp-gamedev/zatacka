/* global setInterval, clearInterval, setTimeout, console, JSON, $ */

// The canvas context
var context;
var players = new Array();
var linearVelocity = 100.0;
var angularVelocity = 0.1;
var deltaTime = 33; 		//milli-secs
var colorUpdateTime = 1000;
var temp = new Array(480000);

var playerId = -1;

// to de removed
var me;

var init = function () {
    initializeContext();
    initializePlayers();
    updateColors();
    setInterval(updateColors, colorUpdateTime);
};

var initializeContext = function () {
    var canvas = document.getElementById('renderer');
    if (canvas.getContext('2d')) {
	console.log("Initialized the canvas context");
	context = canvas.getContext('2d');
    }
    else {
	var box = document.getElementById('canvas');
	var message = document.createTextNode("You need a browser that supports Canvas to run this");
	box.appendChild(message);
    }
};

// todo move to server
var initializePlayers = function () {
    // TODO make this a local variable and add it to players array for multiplayer
    me = {
	location : {
	    x: Math.floor(Math.random()*700),
	    y: Math.floor(Math.random()*500)
	},
	rotation : Math.PI*Math.random(),
	left: false,
	right: false,
	alive: true,
	color: "",
	outgoingPoints: [],
	incomingPoints: [],
	debug: []
    };
    console.log("Initialized player (" + me.location.x + "," + me.location.y + ") with rotation " + me.rotation);
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
				   + (chosenColor === colors[i]
				      ? " checked"
				      : "")
				   + " />" + colors[i] + "<br />";
			   }
			   $('#colors').html(html);
		       });
    jqxhr.fail(function () {
	clearInterval(jqxhr);
    });
};

// will be triggered from the server in multi
var startGame = function () {
    // console.log("startGame");
    setInterval(Tick, deltaTime);
    // post to server and get a blank response
    applyTransformPositions({
	alive: true,
	coloredPositions: {}
    });
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
	       // console.log("success, response = " + JSON.stringify(data));
	       playerId = data['playerId'];
	       console.log("Received playerId: " + playerId);
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
    if (me.alive) {
	calculateTransformDeltas();
	renderCanvas();
    }
};

var calculateTransformDeltas = function () {
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

    me.outgoingPoints.push({
	x : me.location.x + Math.floor(Math.cos(me.rotation)*linearVelocity*deltaTime/1000),
	y : me.location.y + Math.floor(Math.sin(me.rotation)*linearVelocity*deltaTime/1000)
    });
    // console.log("Points contains: " + JSON.stringify(me.outgoingPoints));
};

var sendTransformPositions = function() {
    var request;
    var unique_points = [];

    var i = 0,
	prevPoint;

    for (i = 0; i < me.outgoingPoints.length; i += 1) {
	if (unique_points.length === 0 ||
	    me.outgoingPoints[i].x !== prevPoint.x ||
	    me.outgoingPoints[i].y !== prevPoint.y) {
	    prevPoint = me.outgoingPoints[i];
	    unique_points.push(me.outgoingPoints[i]);
	}
    }

    request = {
	'playerId': playerId,
	'points': unique_points
    };
    me.outgoingPoints = [];

    if (unique_points.length > 0) {
	me.debug.push(unique_points);
    }
    // console.log("Sending positions: " + JSON.stringify(request));

    var jqxhr = $.post('update', JSON.stringify(request), applyTransformPositions, 'json');
    jqxhr.fail(function () {
	console.log("Failed to update positions");
	clearInterval(Tick);
    });
};

var applyTransformPositions = function(response) {
    var positions = [];
    var nextPos = null;
    var coloredPositions = response.coloredPositions;
    var i = 0;;

    me.alive = response.alive;

    // console.log("Received response: " + JSON.stringify(response));

    for (var color in coloredPositions) {
	positions = coloredPositions[color];
	if (positions.length > 0) {
	    me.debug.push(positions);
	}

	me.incomingPoints[color] = [];
	for (i = 0; i < positions.length; i += 1) {
	    nextPos = positions[i];
	    me.incomingPoints[color].push(nextPos);
	    drawLine(me.location, nextPos, color);

	    /*
	     context.closePath();
	     console.log("Drawing line from (" + me.location.x + "," + me.location.y
	     + ") to (" + nextPos.x + "," + nextPos.y + ")");
	     */
	}

	if (nextPos !== null &&
	    me.color === color) {
	    console.log("Updating my location from: " + JSON.stringify(me.location) + " to: " + JSON.stringify(nextPos) + " for response: " + JSON.stringify(response));
	    me.location.x = nextPos.x;
	    me.location.y = nextPos.y;
	}
    }

    if (me.alive) {
	setTimeout("sendTransformPositions();", 10);
    }
    else {
	console.log(JSON.stringify(me.debug));
    }
};

var renderCanvas = function () {
    var i = 0;
    var currentPoint = null,
	nextPoint = null;

    for (var color in me.incomingPoints) {
	for (i = 0; i < me.incomingPoints[color].length - 1; i += 1) {
	    currentPoint = me.incomingPoints[color][i];
	    nextPoint = me.incomingPoints[color][i+1];
	    drawLine(currentPoint, nextPoint, color);
	}

	me.incomingPoints[color] = [];
    }
}

var drawLine = function (from, to, color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
};