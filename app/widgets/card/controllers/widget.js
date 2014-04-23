var App = Alloy.Globals.App;
var card = arguments[0].card || null;
var size = arguments[0].size || 'big';

var imageSize = {
	big: {w: 200, h: 260, t: 23, l: 18, s: 1.17},
	normal: {w: 60, h: 78, t: 10, l: 6, s: 1.2}
};

//App.console.log('Card #' + card.get('number'));

var getClass = function(card, size) {
	size = size || 'normal';
	var rank_name = card.getRankName();
	var rank_class = rank_name === '' ? '' : '_' + rank_name;
	var frame = card.get('frame');
	var frame_class = frame && frame !== '' ? '_' + frame : '';
	return size + 'frame' + frame_class + rank_class;
};

var frame = WPATH('/frames/' + size + '/' + getClass(card, size) + '.png');

$.container.width = imageSize[size].w * imageSize[size].s;
$.container.height = imageSize[size].h * imageSize[size].s;

$.image.top = imageSize[size].t;
$.image.left = imageSize[size].l;
$.image.width = imageSize[size].w;
$.image.height = imageSize[size].h;
$.image.backgroundImage = App.image.getPath(card);

$.frame.top = 0;
$.frame.left = 0;
$.frame.width = imageSize[size].w * imageSize[size].s;
$.frame.height = imageSize[size].h * imageSize[size].s;
$.frame.opacity = 1;
$.frame.backgroundImage = frame;

