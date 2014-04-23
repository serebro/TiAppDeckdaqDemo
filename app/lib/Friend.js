module.exports = function(_, Backbone, App){
	App.Models.Friend = Backbone.Model.extend({
		_name: 'App.Models.Friend',
		defaults: {
			id: '',
			social_id: '',
			first_name: '',
			name: '',
			level: 0,
			in_sys: false,
			is_invited: false
		},
		urlRoot: [
			App.api_url + '/friend/:id/',
			App.api_url + '/friend/:id/:action/'
		],

		getImage: function() {
			return App.getProfileImage(this.get('social_id'));
		}
	});

	App.Collections.Friend = Backbone.Collection.extend({
		_name: 'App.Collections.Friend',
		model: App.Models.Friend,
		urlRoot: [
			App.api_url + '/friend/',
			App.api_url + '/friend/:action/'
		],
		user: null,

		initialize: function(options) {
			options = options || {};
			this.user = options.user || App.user;
			delete options.user;
		},

		fetch: function(options){
			options = options || {};
			options.params = options.params || {user_id: ''};
			options.params.user_id = this.user.id;
			Backbone.Collection.prototype.fetch.apply(this, [options]);
		},

		fetchNeededCounters: function(ids, cb) {
			ids = ids.join(',');
			if (!ids.length) {
				return;
			}

			this.urlParams = {action: 'neededcards', user_id: ids};
			App.ajax.getJSON(this.url(), cb);
			this.urlParams = {};
		}
	});

};
