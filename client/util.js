var lerp = function (beg, end, step) {
    return Math.floor(beg + step * (end - beg));
};

var removeDuplicates = function(points) {
    var unique_points = [];
    var prevPoint,
	i = 0;

    for (i = 0; i < points.length; i += 1) {
	if (unique_points.length === 0 ||
	    points[i].x !== prevPoint.x ||
	    points[i].y !== prevPoint.y) {
	    prevPoint = points[i];
	    unique_points.push(points[i]);
	}
    }

    return unique_points;
};

var getBitPosition = function (x, y) {
    return Math.floor((WIDTH*y + x));
};

var getVector = function(bit) {
    var x = Math.floor(bit % WIDTH);
    var y = Math.floor(bit / WIDTH);
    return {
	x: x,
	y: y
    };
};

var discretize = function(data) {
    if (data.hasOwnProperty('x') && data.hasOwnProperty('y')) {
	return {
	    x: data.x > 0 ? Math.ceil(data.x) : Math.floor(data.x),
	    y: data.y > 0 ? Math.ceil(data.y) : Math.floor(data.y)
	};
    }
    else if (typeof(data) === 'number') {
	return data > 0 ? Math.ceil(data) : Math.floor(data);
    }

    return NaN;
};

exports.discretize = discretize;