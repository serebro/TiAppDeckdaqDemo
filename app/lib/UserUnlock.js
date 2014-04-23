module.exports = function(_, Backbone, App){
	App.Models.UserUnlock = Backbone.Model.extend({
		_name: 'App.Models.UserUnlock',

		parse: function(resp){
			resp = Backbone.Model.prototype.parse(resp); // parse "me" and etc
			resp = resp && resp.data ? resp.data : resp;
			if (resp.model !== 'Badge') {
				resp.name = resp.text;
			}
			return resp;
		}
	});

	App.Collections.UserUnlocks = Backbone.Collection.extend({
		_name: 'App.Collections.UserUnlocks',

		urlRoot: [
			App.api_url + '/user/unlocks/',
		],

		model: App.Models.UserUnlock,
		changed_ids: [],

		getByName: function(action_name) {
			return this.find(function(userUnlock) {
				return userUnlock.get('model') === action_name;
			});
		}
	});
};
