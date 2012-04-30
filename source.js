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
	    leftCode: 37, // left
	    rightCode: 39 // right
	},
	{
	    color: "blue",
	    leftCode: 81, // q
	    rightCode: 87 // w
	},
	{
	    color: "green",
	    leftCode: 85, // u
	    rightCode: 73 // i
	},
	{
	    color: "black",
	    leftCode: 17, // ctrl
	    rightCode: 18 // alt
	},
	{
	    color: "orange",
	    leftCode: 33, // pgup
	    rightCode: 34 // pgdw
	}
    ];

    for (var i = 0; i < colors.length; i += 1) {
	players.push(Player({
	    color: colors[i].color,
	    deltaTime: deltaTime,
	    leftCode: colors[i].leftCode,
	    rightCode: colors[i].rightCode
	}));
    }

    createStatusDiv(colors);
};

var createStatusDiv = function(colors) {
    var i;
    var div = $('#status');
    var html = "<table>";

    for (i = 0; i < colors.length; i += 1) {
	html += "<tr>";
	html += "<td>";
	if (colors[i].leftCode === 37) {
	    html += "LA/RA";
	}
	else if (colors[i].leftCode === 81) {
	    html += "Q/W";
	}
	else if (colors[i].leftCode === 85) {
	    html += "U/I";
	}
	else if (colors[i].leftCode === 17) {
	    html += "Ctrl/Alt";
	}
	else if (colors[i].leftCode === 33) {
	    html += "PgUp/PgDown";
	}
	html += "</td>";
	html += "<td><font color=\"" + colors[i].color + "\">" + colors[i].color + "</font>: </td>";
	html += "<td><span id=\"" + colors[i].color + "\">ALIVE</span></td>";
	html += "</tr>";
    }

    div.html(html);
};

var updateStatusDiv = function(color, status) {
    if ($('#' + color).html() !== status &&
       $('#' + color).html() !== "WINNER") {
	$('#' + color).html(status);
    }
};

var startGame = function () {
    var i = 0;

    for (i = 0; i < players.length; i += 1) {
	players[i].start();
    }
    setInterval(Tick, deltaTime);
};

var onKeyDown = function (event) {
    var i;

    for (i = 0; i < players.length; i += 1) {
	players[i].processInput(event.keyCode, true);
    }
    if (event.stopPropagation) {
	event.stopPropagation();
    }
    if (event.preventDefault) {
	event.preventDefault();
    }
};

var onKeyUp = function (event) {
    var i;

    for (i = 0; i < players.length; i += 1) {
	players[i].processInput(event.keyCode, false);
    }
    if (event.stopPropagation) {
	event.stopPropagation();
    }
    if (event.preventDefault) {
	event.preventDefault();
    }
};

var Tick = function (deltaTime) {
    var i;
    var segment;
    var aliveCount = 0;
    var winner;

    for (i = 0; i < players.length; i += 1) {
	if (players[i].is_alive()) {
	    segment = players[i].update_and_collide(context);
	    if (segment.length === 2) {
		draw_line(segment[0], segment[1], players[i].get_color());
	    }
	    updateStatusDiv(players[i].get_color(), "ALIVE");

	    aliveCount += 1;
	    winner = players[i];
	}
	else {
	    updateStatusDiv(players[i].get_color(), "DEAD");
	}
    }

    if (aliveCount === 1) {
	updateStatusDiv(winner.get_color(), "WINNER");
	winner.kill();
    }
    else {
	// setTimeout(Tick, deltaTime);
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