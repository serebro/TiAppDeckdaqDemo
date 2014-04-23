module.exports = function(_, Backbone, App){
	App.Models.UserDeck = Backbone.Model.extend({
		_name: 'App.Models.Deck',

		RANK_REGULAR: 0,
		RANK_GOLD: 1,

		urlRoot: [
			App.api_url + '/userdeck/:id/:action/',
			App.api_url + '/userdeck/:action/'
		],

		open: function(cb) {
			var self = this;
			this.on('open', cb);
			this.save({}, {
				params: {action: 'open'},
				only_changes: true,
				success: function(model, resp) {
					var userCard, userCards = [];
					_.each(resp.user_cards, function(user_card) {
						userCard = new App.Models.UserCard(user_card);
						userCards.push(userCard);
						App.user.cards.add(userCard);
					});
					self.trigger('open', model, userCards);
				},
				error: App.ajax.errorHandler
			});
		},

		getRankName: function() {
			return (this.get('rank') === 0 ? '' : 'gold');
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp); // parse "me" and etc
			resp = resp && resp.deck ? resp.deck : resp;
			return resp;
		}
	});

	App.Collections.UserDecks = Backbone.Collection.extend({
		_name: 'App.Collections.UserDecks',
		urlRoot: [
			App.api_url + '/userdeck/',
			App.api_url + '/userdeck/:action/',
		],

		model: App.Models.UserDeck,

		initialize: function() {
			this.comparator = this.sortByRank;
		},

		sortByRank: function(deck) {
			return -deck.get('rank');
		}
	});

};
