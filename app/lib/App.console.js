var _timers = {};

module.exports = {
	assert: function() {},
	log: Ti.API.debug,
	warn: Ti.API.warn,
	error: Ti.API.error,
//	warn: errorHandler,
//	error: errorHandler,
	dir: function() {},
	info: Ti.API.info,
	trace: Ti.API.trace,
	collection: function() {},
	time: function(name) {
		_timers[name] = (new Date()).getTime();
	},
	timeEnd: function(name) {
		var diff = ((new Date()).getTime() - _timers[name]) / 1000;
		this.log(name + ': ' + diff + 's');
		delete _timers[name];
		return diff;
	},
	view: function() {}
};