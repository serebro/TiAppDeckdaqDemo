module.exports = function(_, Backbone, App){
	var DS = Ti.Filesystem.separator;

	return {
		getPath: function(object) {
			if (object instanceof App.Models.Deck) {
				var type = arguments[1];
				return Ti.Filesystem.applicationDataDirectory + object.id + '-' + type + '.jpg';
			} else if (object instanceof Backbone.Collection && object.length) {
				return Ti.Filesystem.applicationDataDirectory + object.first().id + '.jpg';
			} else if (object instanceof Backbone.Model) {
				return Ti.Filesystem.applicationDataDirectory + object.id + '.jpg';
			} else {
				return null;
			}
		},

		exists: function() {
			var path = this.getPath.apply(this, arguments);
			var file = Ti.Filesystem.getFile(path);
			return file.exists();
		},

		albumsDownload: function(collection, cb){
			App.console.log('albumsDownload App.image');
			App.console.time('App.image.albumDownload');
			var count = collection.length;
			var path = Ti.Filesystem.applicationDataDirectory;
			var loader = function(model){
				var xhr = App.ajax.request({url: 'http:' + model.attributes.image.large, timeout: 60000});
				xhr.onload = function() {
					var file = Ti.Filesystem.getFile(path + model.id + '.jpg');
					file.write(this.responseData);
					count--;
					App.console.log('Count: ' + count);
					if (count < 1) {
						alert('Download complete. ' + collection.length + ' "'+collection._name+'", ' + App.console.timeEnd('App.image.albumDownload') + 's');
						_.isFunction(cb) && cb();
					}
				};
			};

			collection.each(function(album){
				loader(album);
			});
		},

		decksDownload: function(collection, cb){
			App.console.log('decksDownload App.image');
			App.console.time('App.image.decksDownload');
			var count = collection.length;
			var path = Ti.Filesystem.applicationDataDirectory;
			var loader = function(model){
				var q = new App.Queue();
				q.add(function(next) {
					var xhr = App.ajax.request({url: 'http:' + model.attributes.image.effect, timeout: 60000});
					xhr.onload = function() {
						var file = Ti.Filesystem.getFile(path + model.id + '-effect.jpg');
						file.write(this.responseData);
						next();
					};
				});
				q.add(function(next) {
					var xhr = App.ajax.request({url: 'http:' + model.attributes.image.opened, timeout: 60000});
					xhr.onload = function() {
						var file = Ti.Filesystem.getFile(path + model.id + '-opened.jpg');
						file.write(this.responseData);
						next();
					};
				});
				q.add(function(next) {
					var xhr = App.ajax.request({url: 'http:' + model.attributes.image.normal, timeout: 60000});
					xhr.onload = function() {
						var file = Ti.Filesystem.getFile(path + model.id + '-normal.jpg');
						file.write(this.responseData);
						count--;
						App.console.log('Count: ' + count);
						if (count < 1) {
							alert('Download complete. ' + collection.length + ' "'+collection._name+'", ' + App.console.timeEnd('App.image.decksDownload') + 's');
							_.isFunction(cb) && cb();
						}
					};
				});
			};

			collection.each(function(deck){
				loader(deck);
			});
		},

		cardsDownload: function(collection, cb){
			App.console.time('App.image.cardDownload');
			var count = collection.length;
			var path = Ti.Filesystem.applicationDataDirectory;
			var loader = function(model){
				var xhr = App.ajax.request({url: 'http:' + model.attributes.image.large, timeout: 60000});
				xhr.onload = function() {
					var file = Ti.Filesystem.getFile(path + model.id + '.jpg');
					file.write(this.responseData);
					count--;
					App.console.log('Count: ' + count);
					if (count < 1) {
						alert('Download complete. ' + collection.length + ' "'+collection._name+'", ' + App.console.timeEnd('App.image.downloader') + 's');
						_.isFunction(cb) && cb();
					}
				};
			};

			collection.each(function(card){
				loader(card);
			});
		}
	};
};
