var App = Alloy.Globals.App;
var deck = arguments[0].deck || null;
var size = arguments[0].size || 'normal';
var imageSize = {large: {}, normal: {}, small: {}};
var frameSize = {large: {}, normal: {}, small: {}};
var s = {w: 142, h: 201, t: 16, l: 5, s: 1.902};
//	_large: {w: 534, h: 633, t: 13, l: 15, s: 1},

imageSize.normal.w = s.w;
imageSize.normal.h = s.h;
imageSize.normal.t = s.t;
imageSize.normal.l = s.l;

frameSize.normal.w = s.w * 0.8;
frameSize.normal.h = s.h * 0.8;

//App.console.log('deck #' + deck.get('number'));

var frame = App.image.getPath(deck, 'effect');
var shadow = WPATH('/' + size + '-shadow.png');

$.container.width = frameSize[size].w;
$.container.height = frameSize[size].h;
$.container.backgroundImage = shadow;

$.image.top = imageSize[size].t;
$.image.left = imageSize[size].l;
$.image.right = imageSize[size].l;
$.image.bottom = imageSize[size].t;
$.image.backgroundImage = App.image.getPath(deck, 'normal');

$.frame.top = 2;
$.frame.left = 3;
$.frame.right = 3;
$.frame.bottom = 5;
$.frame.opacity = 1;
$.frame.backgroundImage = frame;
$.frame.model_id = deck.id;

exports.getDeck = function(){
	return deck;
};

exports.getImageSizes = function(size){
	return imageSize[size];
};

exports.getFrameSizes = function(size){
	return frameSize[size];
};
