module.exports = function(_, Backbone, App) {
	App.Models.Order = Backbone.Model.extend({
		_name: 'App.Models.Order',

		TYPE_COIN: 1,
		TYPE_DECK: 2,
		TYPE_ALBUM: 3,
		TYPE_VAR_COIN: 4,
		TYPE_DOUBLE_BONUS: 5,
		TYPE_CARD_SALE: 6,
		TYPE_COIN_SALE: 7,
		TYPE_DECK_SALE: 10,
		//TYPE_BONUS_RESERVE: 11,
		TYPE_CASH: 12,

		TYPE_NAMES: {
			1: 'coin',
			2: 'deck',
			3: 'album',
			4: 'var_coin',
			5: 'double_bonus',
			6: 'card_sale',
			7: 'coin_sale',
			10: 'deck_sale',
			//11: 'bonus_reserve',
			12: 'cash'
		},

		CURRENCY: {USD: '$', EUR: '€', ILS: '₪'},

		urlRoot: [
			App.api_url + '/order/'
		],

		initialize: function() {
			_.bindAll(this);
		}
	});
};
