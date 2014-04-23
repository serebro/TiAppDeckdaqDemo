var App = Alloy.Globals.App;
var album = arguments[0].album || null;
var size = arguments[0].size || 'large';
var imageSize = {large: {}, normal: {}, small: {}};
var frameSize = {large: {}, normal: {}, small: {}};
var s = {w: 240, h: 331, t: 17, l: 14, s: 1.109};
//	_original: {w: 320, h: 441, t: 13, l: 15, s: 1},

imageSize.normal.w = s.w;
imageSize.normal.h = s.h;
imageSize.normal.t = s.t;
imageSize.normal.l = s.l;
imageSize.large.w = s.w * 1.19;
imageSize.large.h = s.h * 1.19;
imageSize.large.t = s.t * 1.19;
imageSize.large.l = s.l * 1.19;
imageSize.small.w = s.w * 0.50;
imageSize.small.h = s.h * 0.50;
imageSize.small.t = s.t * 0.50;
imageSize.small.l = s.l * 0.50;

frameSize.normal.w = s.w * 1.109;
frameSize.normal.h = s.h * 1.109;
frameSize.large.w = s.w * 1.19 * 1.109;
frameSize.large.h = s.h * 1.19 * 1.109;
frameSize.small.w = s.w * 0.50 * 1.109;
frameSize.small.h = s.h * 0.50 * 1.109;

//App.console.log('album #' + album.get('number'));

var getClass = function(album, size) {
	size = size || 'normal';
	var rank_name = album.getRankName();
	var rank_class = rank_name === '' ? '' : '_' + rank_name;
	var frame = album.get('frame');
	var frame_class = frame && frame !== '' ? '_' + frame : '';
	return size + 'frame' + frame_class + rank_class;
};

var frame = WPATH('/frames/largeframe.png');

$.container.width = frameSize[size].w;
$.container.height = frameSize[size].h;

$.image.top = imageSize[size].t;
$.image.left = imageSize[size].l;
$.image.right = imageSize[size].l;
$.image.bottom = imageSize[size].t;
$.image.backgroundImage = App.image.getPath(album);

$.frame.top = 0;
$.frame.left = 0;
$.frame.right = 0;
$.frame.bottom = 0;
$.frame.opacity = 1;
$.frame.backgroundImage = frame;
$.frame.model_id = album.id;

exports.getAlbum = function(){
	return album;
};

exports.getImageSizes = function(size){
	return imageSize[size];
};

exports.getFrameSizes = function(size){
	return frameSize[size];
};
