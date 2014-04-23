module.exports = function(_, Backbone, App){
	App.Models.UserCard = Backbone.Model.extend({
		_name: 'App.Models.UserCard',

		PLACE_FREE: 2,
		PLACE_ALBUM: 3,
		PLACE_PLACEHOLDER: 4,
		PLACE_MARKET: 5,
		PLACE_OFFER: 6,

		urlRoot: [
			App.api_url + '/usercard/:id/',
			App.api_url + '/usercard/:id/:action/'
		],

		initialize: function() {
			App.Models.UserCard.prototype.PLACES_UPGRADE_FOR_MARKET = [this.PLACE_PLACEHOLDER, this.PLACE_ALBUM, this.PLACE_FREE, this.PLACE_MARKET];
			App.Models.UserCard.prototype.PLACES_UPGRADE_FOR_INVENTORY = [this.PLACE_PLACEHOLDER, this.PLACE_ALBUM];
		},

		getValue: function() {
			return App.market.get(this.get('card_id')).get('value');
		},

		getMarketItem: function() {
			return App.market.get(this.get('card_id'));
		},

		/**
		 * @return {App.Models.Card}
		 */
		getCard: function(collection){
			collection = collection || App.cards;
			return collection.get(this.get('card_id'));
		},

		/**
		 * @return {App.Models.StoreAlbum}
		 */
		getAlbum: function() {
			return App.albums.get(this.get('album_id'));
		},

		/**
		 * @return {App.Models.User}
		 */
		getUser: function() {
			// todo: HACK!!!
			if (this.collection && this.collection.user) {
				return this.collection.user;
			} else if (this.attributes.user_id === App.user.id) {
				return App.user;
			} else {
				App.console.log('!!! Unknown user. ID %s', this.attributes.user_id);
				return App.user;
			}
		},

		/**
		 * @return {App.Collections.UserCard}
		 */
		getUserCards: function(){
			return this.getUser().cards;
		},

		/**
		 * @return {App.Collections.Album}
		 */
		getUserAlbums: function(){
			return this.getUser().albums;
		},

		/**
		 * todo: return App.Models.UserAlbum
		 * @return {App.Models.Album}
		 */
		getUserAlbum: function() {
			var user_album_id = this.get('user_album_id');
			if (user_album_id) {
				return this.getUserAlbums().get(this.get('user_album_id'));
			} else {
				var userAlbums = this.getUserAlbums().where({album_id: this.get('album_id')});
				if (userAlbums.length) {
					return userAlbums[0];
				} else {
					qbaka.report('User id#' + this.get('user_id') + ', album id#' + this.get('album_id') + ' not found');
					App.console.error('User (%s) album (%s) not found', this.get('user_id'), this.get('album_id'));
					throw new Error('User album not found');
				}
			}
		},

		/**
		 * @return {string}
		 */
		getRankName: function() {
			return (this.getCard().get('rank') === 0 ? '' : 'gold');
		},

		/**
		 * @param {String} size
		 * @return {String}
		 */
		getClass: function(size) {
			return this.getCard().getClass(size);
		},

		/**
		 * @param {String} size
		 * @param {App.Models.User} user
		 * @return {String}
		 */
		getNeededClass: function(size, user) {
			user = user || this.getUser();
			return this.getCard().getNeededClass(size, null, user);
		},

		/**
		 * @param {String} size
		 * @param {App.Models.User} user
		 * @return {string}
		 */
		getNeedAlbumClass: function(size, user) {
			user = user || this.getUser();
			return this.getCard().getNeedAlbumClass(size, user);
		},

		/**
		 * @param force
		 * @returns {string}
		 */
		getGlowClass: function(force){
			return this.isGlowed() || force ? 'glow-gold' : '';
		},

		/**
		 * @return {Boolean}
		 */
		isGlowed: function() {
			return !!this.getUserCards().where({card_id: this.get('card_id'), place: this.PLACE_ALBUM}).length;
		},

		isNeedCard: function(allow_places, user) {
			user = user || this.getUser();
			return this.getCard().isNeedCard(allow_places, user);
		},

		canUpgradeNow: function(allow_places) {
			return this.getCard().canUpgradeNow(allow_places, this.getUser());
		},

		/**
		 * @deprecated
		 */
		sell: function(price, is_swap) {
			var self = this;
			this.save({
				is_swap: is_swap,
				price: price
			}, {
				params: {action: 'sell'},
				only_changes: true,
				silent: true,
				success: function(userCard, resp) {
					var marketCard = App.market.get(userCard.get('card_id'));
					if (!marketCard) {
						marketCard = new App.Models.Market({id: userCard.get('card_id')});
						App.market.add(marketCard);
					}
					marketCard.fetch(); // get data by id
					self.trigger('sell', userCard, resp);
				},
				error: App.ajax.errorHandler
			});
		},

		sellBack: function() {
			var self = this;
			this.save({}, {
				params: {action: 'sellback'},
				only_changes: true,
				silent: true,
				success: function(userCard, resp) {
					self.trigger('sellBack', userCard, resp);
					self.getUser().cards.remove(userCard, {silent: true});
				},
				error: App.ajax.errorHandler
			});
		},

		sendOffer: function(user_card_id, friend_id, price, is_swap, cb) {
			// todo: check input params
			var self = this;
			self.save({
				user_card_id: user_card_id,
				is_swap: is_swap,
				price: price,
				user_id: friend_id
			}, {
				params: {action: 'sendoffer'},
				only_changes: true,
				silent: true,
				success: function(userCard, resp) {
					self.getUser().cards.remove(userCard, {silent: true});
					var notices = App.notices.filter(function(item) {
						return (item.get('sender').id === friend_id && item.get('card_id') === userCard.get('card_id'));
					});
					if (_.isFunction(cb)) {
						cb(userCard, user_card_id, friend_id, price, is_swap, resp);
					}
					self.trigger('sendOffer', user_card_id, friend_id, price, is_swap, resp);
				},
				error: App.ajax.errorHandler
			});
		},

		/**
		 * @param {App.Models.User} user
		 * @param {Function} cb
		 */
		give: function(user, cb) {
			var self = this;
			this.save({}, {
				params: {action: 'give', user_id: user.id},
				only_changes: true,
				silent: true,
				success: function(userCard, resp) {
					self.getUser().cards.remove(userCard, {silent: true});
					if (_.isFunction(cb)) {
						cb(userCard, resp);
					}
					userCard.trigger('give', resp);
				},
				error: App.ajax.errorHandler
			});
		},

		/**
		 * @param {Number} price
		 * @param {Boolean} is_swap
		 * @param {Object} options
		 */
		updatePrice: function(price, is_swap, options) {
			this.save({
				price: price,
				is_swap: is_swap
			}, _.extend({
				params: {action: 'updateprice'},
				only_changes: true,
				silent: true
			}, options));
		},

		/**
		 * @param {Object} options
		 */
		cancelSell: function(options) {
			var self = this;
			this.fetch(_.extend({params: {action: 'cancelsell'}}, options));
		},

		toAlbum: function() {
			var self = this;

			self.fromAlbumToInventory();

			// request
			this.save({}, {
				params: {action: 'toalbum'},
				only_changes: true,
				success: function(userCard, resp) {
					self.set({place: self.PLACE_ALBUM});
					self.trigger('toAlbum', userCard, resp);
				},
				error: App.ajax.errorHandler
			});

			// change user cards
			var userAlbum = this.getUserAlbum();
			var userCard = this.getUserCards().get(self.id);
			userAlbum.markPossiblePlaceholder(self);

			if (userCard) {
				// if user card exists
				userCard.set({place: self.PLACE_ALBUM, user_album_id: userAlbum.id});
			} else {
				// add new user card
				self.set({place: self.PLACE_ALBUM, user_album_id: userAlbum.id});
				this.getUserCards().add(self);
			}
		},

		toPlaceholder: function() {
			var self = this;
			this.save({}, {
				params: {action: 'toplaceholder'},
				only_changes: true,
				success: function(model, resp) {
					if (resp.album) {
						var userAlbum = self.getUserAlbums().get(resp.album.id);
						userAlbum.set(userAlbum.parse({data: resp.album}));
						userAlbum.trigger('change');
					}
					self.trigger('toPlaceholder', model, resp);
				},
				error: App.ajax.errorHandler
			});
		},

		toInventory: function() {
			var self = this;
			this.save({}, {
				params: {action: 'toinventory'},
				only_changes: true,
				success: function(model, resp) {
					if (resp.album) {
						var album = self.getUserAlbums().get(resp.album.id);
						album.set(album.parse(resp.album));
						album.trigger('change');
					}
					self.trigger('toInventory', model, resp);
				},
				error: App.ajax.errorHandler
			});
		},

		fromAlbumToInventory: function() {
			var self = this;

			// check return card to inventory
			var placeholder = this.getAlbum().findPlaceholder(this.get('card_id'));
			if (!placeholder) {
				qbaka.report('Placeholder not found in album ' + this.album_id + ' for card ' + this.id);
				App.console.warn('Placeholder not found in album %s for card %s', this.album_id, this.id);
			}

			var album_cards = this.getUser().cards.filter(function(item){
				if (item.get('place') === self.PLACE_ALBUM && placeholder.cards.indexOf(item.get('card_id')) > -1) {
					return self.get('rank') > item.getCard().get('rank');
				}
				return false;
			});

			// return card to inventory
			_.each(album_cards, function(item){
				item.set({place: self.PLACE_FREE, user_album_id: null});
			});
		},

		buy: function(price, opt) {
			var self = this;
			this.save({}, {
				params: {
					action: 'buy',
					card_id: this.get('card_id'),
					price: price
				},
				only_changes: true,
				success: function(userCard, resp) {
					if (userCard.get('place') === self.PLACE_ALBUM) {
						userCard.getUserAlbum().markPossiblePlaceholder(userCard);
					}
					App.user.inventory.fetch({success:function(){
						if (opt.success) {
							opt.success(userCard, resp);
						} else {
							self.trigger('buy');
						}
					}});
				},
				error: !opt.error ? App.ajax.errorHandler : function(model, resp, options){
					resp = JSON.parse(resp.responseText);
					qbaka.report('UserCard buy: ' + resp.responseText);
					opt.error(model, resp, options);
				}
			});
		},

		/**
		 * @param {Array} cards_id
		 * @param {Boolean} is_agree_pay
		 * @param opt
	     * @param pay_sum
		 */
		swap: function(cards_id, is_agree_pay, pay_sum, opt) {
			var self = this;
			this.save({}, {
				params: {
					action: 'swap',
					user_id: this.get('user_id'),
					cards: cards_id,
					is_agree_pay: is_agree_pay,
					pay_sum: pay_sum
				},
				only_changes: true,
				success: function(model, resp) {
					var userCard = self.getUserCards().add(resp.data).get(resp.data.id);
					userCard.fromAlbumToInventory();
					if (userCard.get('place') === self.PLACE_ALBUM) {
						var userAlbum = userCard.getUserAlbum();
						if (userAlbum) {
							userAlbum.markPossiblePlaceholder(userCard);
						}
					}

					var userCards = self.getUserCards();
					_.each(cards_id, function(user_card_id) {
						userCards.remove(userCards.get(user_card_id));
					});

					if (opt && opt.success) {
						opt.success(userCard, resp);
					} else {
						self.trigger('swap');
					}
				},
				error: function(model, resp, options){
					resp = JSON.parse(resp.responseText);
					if (App.ajax.hasErrorCode(resp, App.ajax.ERR_CARDS_SWAP_NOT_EQUAL)) {
						App.trackEvent('card', 'swapError', App.ajax.ERR_CARDS_SWAP_NOT_EQUAL);
						(new App.Views.Dialog({cls: 'info', title: 'alert', buttons: [{text: 'Ok', cls: 'b-btn-dialog b-btn-dialog-green submit'}],
							content: '<div class="subtitle">Oops</div><div class="text">Some of your cards are no longer <br> needed by the other player. <br><br> Please add more cards or coins<br>to complete the swap. </div>'
						})).on('hide', function(){
							if (opt && opt.error) {
								qbaka.report('App.ajax.ERR_CARDS_SWAP_NOT_EQUAL');
								opt.error(App.ajax.ERR_CARDS_SWAP_NOT_EQUAL);
							}
						}).show();
					} else if (App.ajax.hasErrorCode(resp, App.ajax.ERR_CARD_PRICE_HIGHER)) {
						App.trackEvent('card', 'swapError', App.ajax.ERR_CARD_PRICE_HIGHER);
						(new App.Views.Dialog({cls: 'info', title: 'alert', buttons: [{text: 'Ok', cls: 'b-btn-dialog b-btn-dialog-green submit'}],
							content: '<div class="subtitle">Cards Value Changed</div><div class="text">The total value of your cards<br>is no longer sufficient for this swap. <br><br> Possible reasons for that:<br> Your cards total value is now lower or the value<br>of the card you desire is now higher.</div>'
						})).on('hide', function(){
							if (opt && opt.error) {
								qbaka.report('App.ajax.ERR_CARD_PRICE_HIGHER');
								opt.error(App.ajax.ERR_CARD_PRICE_HIGHER);
							}
						}).show();
					} else if (App.ajax.hasErrorCode(resp, App.ajax.ERR_CARDS_NOT_SWAP)) {
						App.trackEvent('card', 'swapError', App.ajax.ERR_CARDS_NOT_SWAP);
						(new App.Views.Dialog({cls: 'info', title: 'alert', buttons: [{text: 'Ok', cls: 'b-btn-dialog b-btn-dialog-green submit'}],
							content: '<div class="subtitle">Oops</div><div class="text">This card is no longer available for swap.<br> You may choose another seller to swap with.<br><br>Hurry up next time ;)</div>'
						})).on('hide', function(){
							if (opt && opt.error) {
								qbaka.report('App.ajax.ERR_CARDS_NOT_SWAP');
								opt.error(App.ajax.ERR_CARDS_NOT_SWAP);
							}
						}).show();
					} else {
						self.transactionErrorHandler(model, resp, options);
						if (opt && opt.error) {
							opt.error();
						}
					}
					$.wait('hide');
				}
			});
		},

		ask: function(userModel, cardModel, returnData) {
			this.save({}, {
				params: {
					action: 'ask',
					user_id: userModel.id
				},
				success: function(collection, resp) {
					// todo: ?
				},
				error: App.ajax.errorHandler
			});
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp);
			return resp && resp.data ? resp.data : resp;
		},

		transactionErrorHandler: function(model, resp, options) {
			var dialog;
			var self = this;
			$.wait('hide');
			if (App.ajax.hasErrorCode(resp, App.ajax.ERR_COINS_NOT_ENOUGH)) {
				App.trackEvent('market', 'showPiggy');
				(new App.Views.PiggyDialog({coins: model.get('price')})).show('market');
			} else if (App.ajax.hasErrorCode(resp, App.ajax.ERR_CARD_NOT_ON_MARKET)) {
				dialog = new App.Views.Dialog({
					cls: 'info',
					content: '<div class="subtitle">Card Not Available</div><div class="text">Sorry, it seems that this card is no longer on the Market Place. Someone else probably beat you to it...next time act faster :)</div>',
					buttons: [{
						text: 'Ok',
						cls: 'b-btn-dialog b-btn-dialog-green',
						click: function() {
							this.hide();
						}
					}]
				});
				dialog.on('hide', function() {
					App.market.fetch();
					self.trigger('hideBuyDialog');
					this.hide();
				});
				dialog.show();
			} else if (App.ajax.hasErrorCode(resp, App.ajax.ERR_CARD_PRICE_HIGHER)) {
				dialog = new App.Views.Dialog({
					cls: 'info',
					content: '<div class="subtitle">Card Pricing Changed</div><div class="text">Sorry, it seems that this card is no longer being offered at the advertised price. See new price offer in the "Buy Card" window.</div>',
					buttons: [{
						text: 'Ok',
						cls: 'b-btn-dialog b-btn-dialog-green',
						click: function() {
							this.hide();
						}
					}]
				});
				dialog.on('hide', function() {
					if (resp.data && resp.data.card) {
						var model = new App.Models.Market({id: resp.data.card.card_id});
						model.fetch({success: function(marketModel){
							self.trigger('refreshDialog', marketModel);
						}});

					} else {
						App.market.reload();
						self.trigger('hideDialog');
					}
				});
				dialog.show();
			} else {
				App.ajax.errorHandler(model, resp, options);
			}
		}
	});

	App.Collections.UserCards = Backbone.Collection.extend({
		_name: 'App.Collections.UserCards',

		urlRoot: [
			App.api_url + '/usercard/',
			App.api_url + '/usercard/:action/',
		],

		model: App.Models.UserCard,
		//user: null,

		initialize: function(options) {
			this.user = options.user;
			// todo: FriendInventory
			//this.user = options.user || null;
			//delete options.user;
		},

		countByCardAndPlaces: function(card_id, allow_places) {
			allow_places = allow_places || this.model.prototype.PLACES_UPGRADE_FOR_INVENTORY;
			return this.findByPlace(allow_places, function(item) {
				return item.attributes.card_id === card_id;
			}).length;
		},

		/**
		 * @param {Array} allow_places
		 * @param {function(item:App.Models.Card, i:Number)} callback
		 * @return {Array}
		 */
		findByPlace: function(allow_places, callback) {
			return this.filter(function(item, i) {
				if (allow_places.indexOf(item.attributes.place) < 0) {
					return false;
				}

				return callback.apply(this, [item, i]);
			});
		},

		findAlbumInventory: function(albumModel) {
			return this.where({
				user_album_id: albumModel.id,
				place: App.Models.UserCard.prototype.PLACE_ALBUM
			});
		},

		parse: function(resp) {
			return resp.items || resp;
		}
	});

};
