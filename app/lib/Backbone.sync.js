exports = function(_, Backbone, App){

	Backbone.Collection.prototype.url = function() {
		return Backbone.Model.prototype.getUrlFromTemplate(this);
	};

	/**
	 * Nested params. Example: collection.where({'album.client.id': 123});
	 * @param attrs
	 */
	Backbone.Collection.prototype.where = function(attrs) {
		if (_.isEmpty(attrs)) {
			return [];
		}
		return this.filter(function(model) {
			for(var key in attrs) {
				if (attrs.hasOwnProperty(key)) {
					var t = key.split('.'), v = model.get(t.shift());
					_.each(t, function(it) {v = v[it];});
					if (attrs[key] !== v) {
						return false;
					}
				}
			}
			return true;
		});
	};

	Backbone.Collection.prototype.parse = function(resp) {
		if (resp && resp.me) {
			App.user.set(App.user.parse(resp.me));
		}

		this.refreshed = new Date();
		return resp.items || resp;
	};

	Backbone.Model.prototype.parse = function(resp) {
		if (resp) {
			resp.refreshed = new Date();

//			if (resp.action && resp.action.id) {
//				App.user.actions.get(resp.action.id).set(App.Models.UserAction.prototype.parse(resp.action));
//			}
//
//			if (resp.goodies) {
//				if (resp.goodies.unlocks) {
//					App.user.unlocks.changed_ids = _.pluck(resp.goodies.unlocks, 'id');
//					App.user.unlocks.update(resp.goodies.unlocks, {parse: true, add: true, merge: true, remove: false})
//						.trigger('reset');
//				}
//				if (resp.goodies.actions) {
//					App.user.actions.changed_ids = _.pluck(resp.goodies.actions, 'id');
//					App.user.actions.update(resp.goodies.actions, {parse: true, add: true, merge: true, remove: false})
//						.trigger('reset');
//				}
//			}

			if (resp.me) {
				App.user.set(App.user.parse(resp.me));
			}
		}

		return resp;
	};

	Backbone.Model.prototype.getAttributes = function() {
		var attrs = {};
		_.each(this.attributes, function(attr, name) {
			attrs[name] = attr;
		});
		return attrs;
	};

	Backbone.Model.prototype.url = function() {
		return this.getUrlFromTemplate(this);
	};

	Backbone.Model.prototype.saveChanges = function(attrs, cb) {
		return this.save(attrs, {silent: true, only_changes: true, success: cb});
	};

	// Helper function to make URL from template (Rails like)
	// /videos/:video_id/comments => /videos/6/comments
	// Using urlParams and model attributes for segment keys.
	Backbone.Model.prototype.getUrlFromTemplate = function(object) {
		var url = object.urlRoot || object.url;
		if (_.isString(url)) {
			url = [url];
		}

		// merge urlParams and attributes
		var attrs = object.urlParams || {};
		if (object.attributes && object.attributes.id) {
			attrs.id = object.attributes.id;
		}

		var matched = [], not_matched = [], used = [];
		_.each(url, function(it) {
			var m = null;
			// if found segments
			if (m = it.match(/\:[^\/]+/g)) {
				// if all segment in urlParams & attibutes
				if (_.all(m, function(i) {
					return attrs[i.replace(/^\:/, '')];
				})) {
					// replace segment real value
					var single_matched = it, prm;
					_.each(m, function(i) {
						prm = i.replace(/^\:/, '');
						single_matched = single_matched.replace(i, attrs[prm]);
						used.push(prm);
					});
					matched.push(single_matched);
				}
				// just string
			} else {
				not_matched.push(it);
			}
		});
		for(var i in used) {
			if (used.hasOwnProperty(i)) {
				delete attrs[used[i]];
			}
		}
		delete attrs.id;

		// return longest matched url or first plain url
		url = _.sortBy(matched, function(it) {return 10000 - it.length;})[0];
		url = (url) ? url : not_matched[0];
		attrs.ts = parseInt(Math.random() * 1000000, 10);
		attrs.token = App.token;

		return (_.isEmpty(attrs)) ? url : url + '?' + App.ajax.param(attrs);
	};

	Backbone.sync = function(method, model, options) {
		if (App.ajax.is_stop_requests) {
			return null;
		}

		model.urlParams = options.params;
		delete options.params;

		var getValue = function(object, prop) {
			if (!(object && object[prop])) {
				return null;
			}
			return _.isFunction(object[prop]) ? object[prop]() : object[prop];
		};

		var methodMap = {
			'create': 'POST',
			'update': 'POST',
			'delete': 'DELETE',
			'read': 'GET'
		};
		var type = methodMap[method];

		// Default options, unless specified.
		options = options || {};

		// Default JSON-request options.
		var params = {type: type, dataType: 'json'};

		// Throw an error when a URL is needed, and none is supplied.
		var urlError = function() {
			App.console.error('A "url" property or function must be specified');
		};

		// Ensure that we have a URL.
		if (!options.url) {
			params.url = getValue(model, 'url') || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (!options.data && model && (method === 'create' || method === 'update')) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = options.only_changes ? model.changedAttributes() : model.getAttributes();
			params.data = App.ajax.param(params.data);
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (Backbone.emulateHTTP) {
			if (type === 'PUT' || type === 'DELETE') {
				params.type = type;
				params.beforeSend = function(xhr) {
					xhr.setRequestHeader('X-HTTP-Method-Override', type);
				};
			}
		}

		// Don't process data on a non-GET request.
		params.processData = params.type === 'GET' || method === 'read';

		params.timeout = App.requestTimeout;

		// Make the request, allowing the user to override any Ajax options.
		delete params.changes;

		var error = options.error;
		options.error = function(xhr) {
			if (error) {
				error(model, xhr, options);
			}
			model.trigger('error', model, xhr, options);
		};

		var success = options.success;
		options.success = function(resp, status, xhr) {
			if (resp && resp.success === false) {
				options.error(xhr);
				return;
			}

			if (success) {
				success(model, resp, options); // backbone 0.9.10
				//success(resp, options); // backbone 0.9.2
			}
			model.trigger('sync', model, resp, options);
		};

		// Make the request, allowing the user to override any Ajax options.
        params = _.extend(params, options);
		var xhr = options.xhr = App.ajax.request(params);
		model.trigger('request', model, xhr, options);
		return xhr;
	};
};
