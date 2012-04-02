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

// to de removed
var me;

var init = function () {
    initializeContext();
    initializePlayers();
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
	      for (var i = 0; i < colors.length; i += 1) {
		  html += "<input type=\"checkbox\" value=\""
		      + colors[i] + "\" />" + colors[i] + "<br />";
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
	'name': 'Amey',
	'color': 'blue'
    };
    $.post('join',
	   JSON.stringify(request),
	   function(data) {
	       console.log("success, response = " + JSON.stringify(data));
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
	transformPlayer();
    }
};

var transformPlayer = function () {
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
    context.beginPath();
    context.moveTo(me.location.x, me.location.y);
    context.lineTo(nextPos.x, nextPos.y);
    context.stroke();
/*
    context.closePath();
    console.log("Drawing line from (" + me.location.x + "," + me.location.y
		+ ") to (" + nextPos.x + "," + nextPos.y + ")");
*/

    var deltaX = nextPos.x - me.location.x;
    var deltaY = nextPos.y - me.location.y;
    var len = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

    var points = new Array();

    for (i=1; i<len; i++) {
	points.push({
			 x: lerp(me.location.x, nextPos.x, i/len),
			 y: lerp(me.location.y, nextPos.y, i/len)
		     });
    }

    var bits = new Array();

    skip:
    for (i=0; i<points.length; i++) {
	var position = getBitPosition(points[i].x, points[i].y);
	for (j=0; j<bits.length; j++) {
	    if (position == bits[j]) {
		continue skip;
	    }
	}

	bits.push(position);
    }

    var collided = false;
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
};

var getBitPosition = function (x, y) {
//    console.log("(" + x + "," + y + ") => " + (WIDTH*y + x));
    return (WIDTH*y + x);
};

var lerp = function (beg, end, step) {
    return Math.floor(beg + step * (end - beg));
};
