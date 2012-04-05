// The canvas context
var context;
var players = new Array();
var linearVelocity = 100.0;
var angularVelocity = 0.1;
var deltaTime = 33; 		//milli-secs
var colorUpdateTime = 1000;
var temp = new Array(480000);
var pixelArray = new BitArray(480000);

var WIDTH = 800;
var HEIGHT = 600;

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
	inputQueue : new Array()
    };
    console.log("Initialized player (" + me.location.x + "," + me.location.y + ") with rotation " + me.rotation);
};

var updateColors = function () {
    $.post('getColors',
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
		      + (chosenColor === colors[i] ? " checked" : "")
		      + " />" + colors[i] + "<br />";
	      }
	      $('#colors').html(html);
	  });
};

// will be triggered from the server in multi
var startGame = function () {
    // console.log("startGame");
    setInterval(Tick, deltaTime);
};

var joinGame = function () {
    var request = {
    };
    $('.color').each(function(index) {
			 if ($(this).prop('checked') === true) {
			     request.color = $(this).prop('value');
			     return false;
			 }
			 return true;
		     });
    request.name = $('#name').val();
    $.post('join',
	   request,
	   function(data) {
	       // console.log("success, response = " + JSON.stringify(data));
	       playerId = data['playerId'];
	       console.log("Received playerId: " + playerId);
	   },
	   'json');
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
    }
};

var calculateTransformDeltas = function () {
    if ( (me.left == true) && (me.right == false) ) {
	console.log("Turning left");
	me.rotation -= angularVelocity;
    }
    else if ( (me.left == false) && (me.right == true) ) {
	console.log("Turning right");
	me.rotation += angularVelocity;
    }
    else {
//	console.log("Going straight");
	// going straight
    }

    var nextPos = {
	x : me.location.x + Math.floor(Math.cos(me.rotation)*linearVelocity*deltaTime/1000),
	y : me.location.y + Math.floor(Math.sin(me.rotation)*linearVelocity*deltaTime/1000)
    };

    var deltaX = nextPos.x - me.location.x;
    var deltaY = nextPos.y - me.location.y;
    var len = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

    var points = [], unique_points = [];
    var request = {};

    var i = 0, j = 0, prevPoint;

    for (i=1; i<len; i++) {
	points.push({
			 x: lerp(me.location.x, nextPos.x, i/len),
			 y: lerp(me.location.y, nextPos.y, i/len)
		     });
    }

    for (i = 0; i < points.length; i += 1) {
	if (unique_points.length === 0 ||
	    points[i].x !== prevPoint.x ||
	    points[i].y !== prevPoint.y) {
	        prevPoint = points[i];
	        unique_points.push(points[i]);
	}
    }

    request = {
	'playerId': playerId,
	'deltas': unique_points
    };

    $.post('getColors', request, applyTransformDeltas, 'json');
};

var applyTransformDeltas = function(coloredDeltas) {
    var deltas = [];
    var bits = [];
    var i = 0;

    for (var color in coloredDeltas) {
	deltas = coloredDeltas[color];


	for (i=0; i<bits.length; i++) {
	    if (pixelArray.getAt(bits[i]) == BitArray._ON) {
		collided = true;
		console.log("collided");
		console.log("pos=" + bits[i]);
		break;
	    }
	    console.log("pos=" + bits[i]);
	    pixelArray.setAt(bits[i], 1);
	}

	context.beginPath();
	context.moveTo(me.location.x, me.location.y);
	context.lineTo(nextPos.x, nextPos.y);
	context.stroke();

	/*
	 context.closePath();
	 console.log("Drawing line from (" + me.location.x + "," + me.location.y
	 + ") to (" + nextPos.x + "," + nextPos.y + ")");
	 */

	if (collided == false) {
	    me.location.x = nextPos.x;
	    me.location.y = nextPos.y;
	}

	if ( (me.location.x < 0) ||
	    (me.location.y < 0) ||
	     (me.location.x > WIDTH) ||
	     (me.location.y > HEIGHT) ||
	     (collided == true) ) {
 	    me.alive = false;
	}
    }
};

var getBitPosition = function (x, y) {
//    console.log("(" + x + "," + y + ") => " + (WIDTH*y + x));
    return (WIDTH*y + x);
};

var lerp = function (beg, end, step) {
    return Math.floor(beg + step * (end - beg));
};
