var App = Alloy.Globals.App;
var self = this;

exports.show = function(cb) {
	_.isFunction(cb) && cb.apply(this);
};

exports.hide = function(cb) {
	_.isFunction(cb) && cb();
};

exports.ui = {
	show: {duration: 250},
	hide: {duration: 250}
};

exports.anim = function(view, params, effects, cb){
	_.extend(params, effects);
	var animation = Ti.UI.createAnimation(params);

	if (_.isFunction(cb)) {
		var handler = function(){
			animation.removeEventListener('complete', handler);
			animation = null;
			cb();
		};
		animation.addEventListener('complete', handler);
	}

	return view.animate(animation);
};
