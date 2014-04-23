module.exports = function(_, Backbone, App){

	App.Models.Deck = Backbone.Model.extend({
		_name: 'App.Models.Deck',
		urlRoot: [
			App.api_url + '/deck/:id/',
			App.api_url + '/deck/:id/:action/',
		],

		RARE_COMMON: 0,
		RARE_VERY: 8,
		RARE_ULTRA: 9,

		buy: function(opt) {
			this.fetch({
				params: {
					action: 'buy',
					count: opt.count,
					buy_token: App.user.get('buy_token')
				},
				success: function(model, resp) {
					if (opt.success) {
						opt.success(model, resp);
					} else {
						model.trigger('buy', resp);
					}
				},
				error: !opt.error ? App.ajax.errorHandler : function(model, resp, options){
					resp = JSON.parse(resp.responseText);
					qbaka.report('Deck buy: ' + resp.responseText);
					opt.error(model, resp, options);
				}
			});
		},

		getAlbum: function() {
			var album = App.albums.get(this.get('album_id'));

			if (!album) {
				qbaka.report('StoreDecks:isLocked -- Store album #' + this.get('album_id') + ' not found');
				App.console.warn('StoreDecks:isLocked -- Store album #%s not found', this.get('album_id'));
				return false;
			}

			return album;
		},

		canBuyAlbum: function() {
			return this.getAlbum() && !this.getAlbum().get('is_locked');
		},

		getType: function() {
			var types = {'00': 'regular', '10': 'gold', '08': 'mega', '09': 'ultra'};
			var code = this.get('rank').toString() + this.get('rare').toString();
			return types[code] ? types[code] : types['00'];
		},

		getPrice: function(count) {
			var prices = _.where(App.settings.buy.decks, {type: this.getType(), amount: count});
			if (!prices.length) {
				return false;
			}

			return {coins: prices[0].coins, cash: prices[0].cash};
		},

		/**
		 * For show "Why"
		 * @return {Boolean}
		 */
		isLocked: function() {
			return this.get('is_locked') && !this.canBuyAlbum();
		},

		/**
		 * For show "Special edition pack"
		 * @return {boolean}
		 */
		isInstantBuy: function() {
			return !this.get('is_locked') && this.get('is_money');
		},

		/**
		 * For show time limit countdown
		 * @param user
		 * @return {boolean}
		 */
		isTimeLimit: function(user) {
			if (this.get('is_money') || !this.canBuyAlbum()) {
				return false;
			}

			var userAction = user.actions.getByName('ActionBuyDeck');
			return userAction.get('refreshed').getTime() + userAction.get('counters').seconds * 1000 > (new Date().getTime()) &&
					userAction.get('counters').count >= userAction.get('params').count;
		},

		getRareName: function() {
			if (this.get('rare') === this.RARE_VERY) {
				return 'Mega Pack';
			} else if (this.get('rare') === this.RARE_ULTRA) {
				return 'Ultra Pack';
			}

			return '';
		},

		getRareDescription: function() {
			if (this.get('rare') === this.RARE_VERY) {
				return 'At least 1 Very Rare or Extremely Rare card guaranteed';
			} else if (this.get('rare') === this.RARE_ULTRA) {
				return 'At least 2 Very Rare or Extremely Rare cards guaranteed';
			}

			return '';
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp);
			return resp && resp.data ? resp.data : resp;
		}
	});

	App.Collections.Decks = Backbone.Collection.extend({
		urlRoot: [
			App.api_url + '/deck/',
		],
		model: App.Models.Deck,

		parse: function(resp) {
			return resp.items || resp;
		}
	});

	App.decks = new App.Collections.Decks();

};
