module.exports = function(_, Backbone, App){
	App.Models.UserRequest = Backbone.Model.extend({
		_name: 'App.Models.UserRequest',

		urlRoot: [
			App.api_url + '/userrequest/:id/',
			App.api_url + '/userrequest/:id/:action/',
			App.api_url + '/userrequest/'
		],

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp); // parse "me" and etc
			resp = resp && resp.data ? resp.data : resp;
			return resp;
		}
	});

	App.Collections.UserRequests = Backbone.Collection.extend({
		_name: 'App.Collections.UserRequests',
		urlRoot: [
			App.api_url + '/userrequest/',
			App.api_url + '/userrequest/:action/'
		],
		model: App.Models.UserRequest,

		getUsersId: function() {
			return _.uniq(this.pluck('user_id'));
		},

		getCardsId: function() {
			return _.uniq(this.pluck('card_id'));
		},

		getCardsByUser: function() {
			var cards = {};

			this.each(function(cardModel){
				if (cards[cardModel.get('user_id')] === undefined) {
					cards[cardModel.get('user_id')] = [];
				}
				cards[cardModel.get('user_id')].push(cardModel.get('card_id'));
			});

			return cards;
		},

		parse: function(resp) {
			return resp.items || resp;
		}
	});
};
