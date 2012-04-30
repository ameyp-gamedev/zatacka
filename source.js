/* global setInterval, clearInterval, setTimeout, console, JSON, $, discretize */

// The canvas context
var context;
var players = [];

var linearVelocity = 100.0;
var angularVelocity = 0.1;
var deltaTime = 33; 		//milli-secs
var colorUpdateTime = 1000;

var init = function () {
    initializeContext();
    initializePlayers();
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

var initializePlayers = function(origins) {
    var colors = [
	{
	    color: "red",
	    leftCode: 37,
	    rightCode: 39
	},
	{
	    color: "blue",
	    leftCode: 37,
	    rightCode: 39
	}/*,
	{
	    color: "green",
	    leftCode: 37,
	    rightCode: 39
	},
	{
	    color: "black",
	    leftCode: 37,
	    rightCode: 39
	},
	{
	    color: "orange",
	    leftCode: 37,
	    rightCode: 39
	}*/
    ];

    for (var i = 0; i < colors.length; i += 1) {
	players.push(Player({
	    color: colors[i].color,
	    deltaTime: deltaTime,
	    leftCode: colors[i].leftCode,
	    rightCode: colors[i].rightCode
	}));
    }
};

var startGame = function () {
    setInterval(Tick, deltaTime);
};

var onKeyDown = function (event) {
    var i;

    for (i = 0; i < players.length; i += 1) {
	players[i].processInput(event.keyCode, true);
    }
};

var onKeyUp = function (event) {
    var i;

    for (i = 0; i < players.length; i += 1) {
	players[i].processInput(event.keyCode, false);
    }
};

var Tick = function () {
    var i;
    var segment;

    for (i = 0; i < players.length; i += 1) {
	if (players[i].is_alive()) {
	    segment = players[i].update_and_collide(context);
	    draw_line(segment[0], segment[1], players[i].get_color());
	}
    }
};

var draw_line = function (from, to, color) {
    // console.log("Drawing line from [" + from.x + "," + from.y + "] to [" + to.x + "," + to.y + "]");
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
};