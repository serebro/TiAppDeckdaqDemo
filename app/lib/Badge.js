module.exports = function(_, Backbone, App){

	/* Badges */
	App.Models.Badge = Backbone.Model.extend({
		_name: 'App.Models.Badge',
		urlRoot: [App.api_url + '/badge/:id/']
	});

	App.Collections.Badge = Backbone.Collection.extend({
		_name: 'App.Collections.Badge',
		urlRoot: [App.api_url + '/badge/'],
		model: App.Models.Badge,

		parse: function(resp, xhr) {
			Backbone.Collection.prototype.parse(resp);
			App.badgePlates = new App.Collections.BadgePlate({items: resp.plates}, {parse: true});
			App.badgePlates.refreshed = new Date();
			return resp.badges;
		}
	});


	/* Plates */
	App.Models.BadgePlate = Backbone.Model.extend({
		_name: 'App.Models.BadgePlate',
		urlRoot: [App.api_url + '/plate/:id/'],

		parse: function(resp) {
			// todo: HACK
			var albums = App.user.albums.where({album_id: resp.album_id});
			if (albums.length) {
				resp.created = new Date(albums[0].get('created'));
			}
			//

			return resp;
		}
	});

	App.Collections.BadgePlate = Backbone.Collection.extend({
		_name: 'App.Collections.BadgePlate',
		urlRoot: [App.api_url + '/badgeplate/'],
		model: App.Models.BadgePlate,

		comparator: function(model) {
			return -model.get('created');
		}
	});

};
