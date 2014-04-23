module.exports = function(_, Backbone, App){
	App.Models.Rule = Backbone.Model.extend({
		_name: 'App.Models.Rule',
		urlRoot: [
			App.api_url + '/rule/:id/',
		],

		parse: function(resp){
			return resp.data || resp;
		}
	});

	App.Collections.Rules = Backbone.Collection.extend({
		_name: 'App.Collections.Rules',

		EVENT_PLACE_CARD: 1,
		EVENT_UPGRADE_CARD: 2,
		EVENT_LEVEL_UP: 3,

		model: App.Models.Rule,

		urlRoot: [
			App.api_url + '/rule/',
		],

		parse: function(resp){
			return resp.items || resp;
		}
	});
};
