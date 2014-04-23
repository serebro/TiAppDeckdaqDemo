module.exports = function(_, Backbone, App){
	App.Models.UserAlbum = Backbone.Model.extend({
		_name: 'App.Models.UserAlbum',
		urlRoot: [
			App.api_url + '/useralbum/:id/',
			App.api_url + '/useralbum/:id/:action/'
		],

		/**
		 * @return {App.Models.User}
		 */
		getUser: function() {
			// todo:
			if (this.collection.user) {
				return this.collection.user;
			} else if (this.attributes.user.id === App.user.id) {
				return App.user;
			} else {
				App.console.log('!!! Unknown user. ID %s', this.attributes.user.id);
				return App.user; // todo: HACK!!!
			}
		},

		getAlbum: function(){
			return App.albums.get(this.get('album_id'));
		},

		getUserAlbums: function(){
			return this.getUser().albums;
		},

		/**
		 * @deprecated
		 * @return {Array}
		 */
		getUpgradeableCards: function() {
			var result = [];

			var rules = this.get('rules').where({type: 'UpgradeCard'});
			if (rules.length) {
				result = rules[0].get('upgradeable_cards');
			}

			return result;
		},

		/**
		 * @param card_id
		 * @return {Number}
		 */
		getUpgradedCount: function(card_id) {
			var upgraded_card = this.get('upgraded_cards')[card_id];
			return upgraded_card === undefined ? 0 : upgraded_card.count;
		},

		/**
		 * @deprecated
		 * @return {string}
		 */
		getRankName: function() {
			return (this.get('rank') === 0 ? '' : 'gold');
		},

		/**
		 * @param {string} size
		 * @returns {string}
		 */
		getOwnedClass: function(size) {
			size = size || 'normal';
			var is_owned = !!this.getUserAlbums().where({album_id: this.get('album_id')}).length;
			var owned_class = is_owned ? '-owned' : '';
			return 'b-album-' + size + owned_class;
		},

		/**
		 * @param {string} size
		 * @return {string}
		 */
		getCompletedClass: function(size) {
			size = size || 'normal';
			var self = this;
			var count_gold_cards = this.getUser().cards.filter(function(userCard){
				return userCard.attributes.place === App.Models.UserCard.prototype.PLACE_PLACEHOLDER &&
					userCard.attributes.album_id === self.get('album_id') &&
					userCard.attributes.user_id === self.get('user').id &&
					userCard.getCard().get('rank') === 1;
			}).length;
			var album = this.getAlbum();
			var is_completed_gold = count_gold_cards === album.get('count_placeholders');
			var is_completed = this.get('count_cards') === album.get('count_placeholders');
			var completed = is_completed ? '-completed' : '';
			var rank_class = is_completed_gold ? '-gold' : '';
			return 'b-album-' + size + completed + rank_class;
		},

		getClass: function(size) {
			size = size || 'normal';
			var rank_name = this.getRankName();
			var rank_class = rank_name === '' ? '' : '-' + rank_name;
			var frame = this.getAlbum().get('frame');
			var frame_class = frame && frame !== '' ? frame + '-' : '';
			return size + ' b-album-' + frame_class + size + rank_class;
		},

		getOpenedClass: function() {
			var rank_name = this.getRankName();
			var rank_class = rank_name === '' ? '' : '-' + rank_name;
			var frame = this.get('frame');
			var frame_class = frame && frame !== '' ? frame + '-' : '';
			return 'b-album-opened-cover' + frame_class + rank_class;
		},

		getPlaceholderIndex: function(page_index, card_id) {
			var placeholder_index = 0;
			_.find(this.get('pages')[page_index].placeholders, function(ph) {
				++placeholder_index;
				return ph.cards.indexOf(card_id) > -1;
			});
			return placeholder_index - 1;
		},

		/**
		 * @deprecated
		 * @param {String} card_id
		 * @return {Boolean}
		 */
		isUpgradeableCard: function(card_id) {
			return this.getUpgradeableCards().indexOf(card_id) > -1;
		},

		/**
		 * @deprecated
		 * @param {string} card_id
		 * @return {Object}
		 */
		findPlaceholder: function(card_id) {
			return this.getAlbum().findPlaceholder(card_id);
		},

		/**
		 * @param {Number} ph_order
		 * @returns {Object|boolean} Object {card: App.Models.UserCard, cards: ["id", "id"], order: "02"}
		 */
		findPlaceholderByOrder: function(ph_order) {
			var page, placeholder = null, ph_order = Number(ph_order);
			page = _.find(this.get('pages'), function(page) {
				placeholder = _.find(page.placeholders, function(ph) {
					return Number(ph.order) === ph_order;
				});
				return !!placeholder;
			});
			return placeholder || !!page;
		},

		fetchPageInfo: function(page, cb) {
			this.urlParams = {action: 'pageinfo', page: page};
			return App.ajax.getJSON(this.url(), cb);
		},

		/**
		 * Find and mark placeholder where this card can be inserted.
		 * @param {App.Models.Card} userCard
		 */
		markPossiblePlaceholder: function(userCard) {
			var placeholder = this.getUserAlbums().findPlaceholder(userCard.get('card_id'));
			if (placeholder) {
				placeholder.possible_card = userCard;
			}
		},

		/**
		 * @static
		 * @param resp - one my album full info
		 */
		parse: function(resp) {
			var self = this;
			var place_placeholder = App.Models.UserCard.prototype.PLACE_PLACEHOLDER;
			var place_album = App.Models.UserCard.prototype.PLACE_ALBUM;
			var userCard;

			resp = Backbone.Model.prototype.parse(resp);
			var user_album = resp.data ? resp.data : resp;
			var album = App.albums.get(user_album.album_id);
			var pages = album.get('pages');

			self.attributes.user = user_album.user;

			_.each(pages, function(page) {
				_.each(page.placeholders, function(placeholder, i) {
					userCard = self.getUser().cards.find(function(userCard){
						return userCard.get('place') === place_album &&
								userCard.get('album_id') === album.id &&
								placeholder.cards.indexOf(userCard.get('card_id')) > -1;
					});
					if (userCard) {
						page.placeholders[i].possible_card = userCard;
					}

					userCard = self.getUser().cards.find(function(userCard){
						return userCard.get('place') === place_placeholder &&
								userCard.get('user_album_id') === user_album.id &&
								placeholder.cards.indexOf(userCard.get('card_id')) > -1;
					});
					page.placeholders[i].card = userCard;
				});
			});

			user_album.rules = new App.Collections.Rules(user_album.rules);
			user_album.pages = pages;

			return user_album;
		}
	});

	App.Collections.UserAlbums = Backbone.Collection.extend({
		_name: 'App.Collections.UserAlbums',
		urlRoot: [
			App.api_url + '/useralbum/'
		],
		model: App.Models.UserAlbum,

		initialize: function(options) {
			this.user = options.user;
		},

		getUser: function(){
			var user_id = this.first() ? this.first().get('user_id') : App.user; // todo: HACK!!!
			if (this.user) {
				return this.user;
			} else if (user_id === App.user.id) {
				return App.user;
			} else {
				App.console.log('!!! Unknown user. ID %s', user_id);
				return App.user;
			}
		},

		/**
		 * @param album_id
		 * @returns {Boolean|App.Models.UserAlbum}
		 */
		getByAlbumId: function(album_id){
			return this.getUser().albums.find(function(userAlbum){
				return userAlbum.attributes.album_id === album_id;
			});
		},

		findPlaceholder: function(card_id) {
			var page = null,
				placeholder = null;

			this.find(function(userAlbum) {
				placeholder = userAlbum.findPlaceholder(card_id);
				return placeholder || false;
			});

			return placeholder;
		},

		/**
		 * @param {App.Models.UserAlbum} userAlbum
		 * @returns {number}
		 */
		sortByNotPut: function(userAlbum){
			return -this.getUser().cards.findAlbumInventory(userAlbum).length * 1000 - userAlbum.getAlbum().get('order');
		},

		/**
		 * @param {App.Models.UserAlbum} userAlbum
		 * @returns {number}
		 */
		sortByOrder: function(userAlbum) {
			return -userAlbum.getAlbum().get('order');
		},

		parse: function(resp) {
			Backbone.Collection.prototype.parse(resp);
			return resp.items;
		}
	});

};
