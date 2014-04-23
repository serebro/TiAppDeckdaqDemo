/**
 * @return {{_queue: Array, add: Function}}
 * @constructor
 */
module.exports = function() {
	return {
		_queue: [],
		add: function(fn){
			var queue = this._queue;
			queue.push(fn);
			if (this._queue.length === 1) {
				fn(next);
			}

			function next() {
				queue.shift();
				if (queue.length) {
					var params = [next];
					for(var i in arguments) {
						if (arguments.hasOwnProperty(i)) {
							params.push(arguments[i]);
						}
					}
					queue[0].apply(this, params);
				}
			}
		}
	};
};
