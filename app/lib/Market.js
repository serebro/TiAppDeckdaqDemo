module.exports = function(_, Backbone, App){
	App.Models.Market = Backbone.Model.extend({
		_name: 'App.Models.Market',
		urlRoot: [
			App.api_url + '/market/:id',
			App.api_url + '/market/:id/:action/',
		],

		getCard: function() {
			return App.cards.get(this.id);
		},

		getHumanEdition: function() {
			return this.getCard().getHumanEdition();
		},

		getUserCardData: function() {
			var data = this.getAttributes();
			data.card_id = data.id;
			data.id = data.user_card_id;
			data.place = App.Models.UserCard.prototype.PLACE_MARKET;
			data.price = data.lowest_price;
			//todo: data.user_id =

			delete data.count;
			delete data.user_card_id;
			delete data.count_swap_cards;
			delete data.lowest_price;
			delete data.midnight_price;

			return data;
		},

		getCountSuffix: function(value) {
			var suffixes = ['st', 'nd', 'rd', 'th'];
			if (value < 1 || value > 4) {
				return '';
			}
			return suffixes[value - 1];
		},

		parse: function(resp) {
			//resp = Backbone.Model.prototype.parse(resp);
			resp.user = new App.Models.User(resp.user);
			//resp.is_money = resp.lowest_price > 90;
			resp.is_money = false; //temporarily remove the ability to buy with cash/money
			return resp;
		}
	});

	App.Collections.Market = Backbone.Collection.extend({
		_name: 'App.Collections.Market',
		urlRoot: [
			App.api_url + '/market/',
			App.api_url + '/market/:action/',
		],
		model: App.Models.Market,

		initialize: function() {
//			setInterval(function() {
//				App.market.fetch();
//			}, 2.1 * 60 * 1000);
		},

		// todo: refactor to variable sort field
		comparator: function(model) {
			return model.get('number');
		},

		/**
		 * Return all unique albums on market
		 * @return {Object} [album_id: album_name]
		 */
		findAlbums: function() {
			var albums = {}, album_id;
			this.each(function(item) {
				album_id = item.get('album').id;
				if (!albums[album_id]) {
					albums[album_id] = item.get('album').name;
				}
			});

			return albums;
		}
	});

	/* Market offers */
	App.Models.MarketOffer = Backbone.Model.extend({
		_name: 'App.Models.MarketOffer',
		urlRoot: [
			App.api_url + '/card/:id/:action/',
		]
	});

	App.Collections.MarketOffer = Backbone.Collection.extend({
		_name: 'App.Collections.MarketOffer',
		urlRoot: [
			App.api_url + '/market/:id/:action/',
		],
		model: App.Models.MarketOffer
	});

	App.Collections.SwapAvailableCard = Backbone.Collection.extend({
		_name: 'App.Collections.SwapAvailableCard',
		urlRoot: [
			App.api_url + '/card/swapavailable/',
		],
		model: App.Models.SwapAvailableCard
	});

};
