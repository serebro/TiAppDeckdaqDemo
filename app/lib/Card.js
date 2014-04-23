//A.Backbone.sync = require('ti_rest').sync

module.exports = function(_, Backbone, App){
	App.Models.Card = Backbone.Model.extend({
		_name: 'App.Models.Card',

		RANK_REGULAR: 0,
		RANK_GOLD: 1,

		ORIENTATION_VV: 0, // front and back vertical (regular)
		ORIENTATION_VH: 1, // front vertical and back horizontal
		ORIENTATION_HV: 2, // front horizontal and back vertical
		ORIENTATION_HH: 3, // front horizontal and back horizontal

		EDITION_NAMES: {1: 'First', 2: 'Second', 3: 'Third'},

		urlRoot: [
			App.api_url + '/card/:id/',
			App.api_url + '/card/:id/:action/'
		],

		initialize: function() {
		},

		/**
		 * @return {App.Models.Album}
		 */
		getAlbum: function() {
			return App.albums.get(this.get('album_id'));
		},

		/**
		 * @returns {Number}
		 */
		getUpgradedCount: function(user){
			user = user || App.user;
			var userAlbums = user.albums.where({album_id: this.get('album_id')});
			if (!userAlbums.length) {
				return 0;
			}

			return userAlbums[0].getUpgradedCount(this.get('card_id'));
		},

		/**
		 * @return {string}
		 */
		getTemplateName: function() {
			return 'tplCardBackside_' + this.get('backside').type;
		},

		/**
		 * @return {string}
		 */
		getHumanEdition: function() {
			return this.EDITION_NAMES[this.get('edition')] || this.get('edition');
		},

		/**
		 * @return {string}
		 */
		getRankName: function() {
			return (this.get('rank') === 0 ? '' : 'gold');
		},

		/**
		 * @param {String} size
		 * @return {String}
		 */
		getClass: function(size) {
			size = size || 'normal';
			var rank_name = this.getRankName();
			var rank_class = rank_name === '' ? '' : '-' + rank_name;
			var frame = this.get('frame');
			var frame_class = frame && frame !== '' ? frame + '-' : '';
			return size + ' b-card-' + frame_class + size + rank_class;
		},

		/**
		 * @param {App.Models.User} user
		 * @param {String} size
		 * @return {String}
		 */
		getNeededClass: function(size, allow_places, user) {
			user = user || App.user;
			size = size || 'normal';
			var is_exists_album = !!user.albums.where({album_id: this.get('album_id')}).length;
			var needed = is_exists_album ? (this.canUpgradeNow(allow_places, user) ? '-upgrade' : '-needed') : '-need-album';
			return 'b-card-' + size + needed;
		},

		/**
		 * @param {App.Models.User} user
		 * @param {string} size
		 * @return {string}
		 */
		getNeedAlbumClass: function(size, user) {
			user = user || App.user;
			size = size || 'normal';
			var is_exists_album = !!user.albums.where({album_id: this.get('album_id')}).length;
			var needed = is_exists_album ? '' : '-need-album';
			return 'b-card-' + size + needed;
		},

		/**
		 * @param {Array} allow_places
		 * @param {App.Models.User} user
		 * @returns {Boolean}
		 */
		canUpgradeNow: function(allow_places, user) {
			user = user || App.user;
			var count_cards = user.cards.countByCardAndPlaces(this.id, allow_places);
			return this.isUpgradeable() && count_cards > 0 && count_cards < this.getAlbum().getMaxUpgradeCards();
		},

		/**
		 * @return {Boolean}
		 */
		isUpgradeable: function() {
			var album = this.getAlbum();
			return album ? album.isUpgradeableCard(this.id) : false;
		},

		/**
		 * @param {App.Models.User} user
		 * @param {Array} allow_places
		 * @returns {Boolean}
		 */
		isNeedCard: function(allow_places, user) {
			user = user || App.user;
			var album = this.getAlbum();
			if (!album) {
				return false;
			}

			var self = this;

			// if exists 5 and more regular related cards
			if (this.get('rank') > 0) {
				var count = user.cards.filter(function(userCard) {
					return userCard.get('album_id') === self.get('album_id') &&
							userCard.getCard().get('refs').rank.higher === self.id;
				}).length;
				if (count && count > this.getAlbum().getMaxUpgradeCards() - 1) {
					return false;
				}
			}

			var placeholder = album.findPlaceholder(this.id);
			if (!placeholder) {
				qbaka.report('Placeholder not found in user album ' + this.get('album_id') + ' for card ' + this.id);
				App.console.warn('Placeholder not found in user album ' + this.get('album_id') + ' for card ' + this.id);
			}

			allow_places = allow_places || App.Models.UserCard.prototype.PLACES_UPGRADE_FOR_INVENTORY;
			var max_rank = 0;
			var album_cards = user.cards.filter(function(item){
				if (allow_places.indexOf(item.attributes.place) < 0) {
					return false;
				}

				if (placeholder.cards.indexOf(item.attributes.card_id) < 0) {
					return false;
				}

				var card = App.cards.get(item.attributes.card_id);
				if (card.attributes.rank > max_rank) {
					max_rank = card.attributes.rank;
				}
				return true;
			});

			if (album_cards.length === 0) {
				return true;
			}

			if (this.attributes.rank > max_rank) {
				return true;
			}

			if (this.attributes.rank === max_rank) {
				return this.canUpgradeNow(allow_places);
			}

			return false;
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp); // parse "me" and etc
			resp = resp && resp.data ? resp.data : resp;
			return resp;
		}
	});

	App.Collections.Cards = Backbone.Collection.extend({
		_name: 'App.Collections.Cards',

		urlRoot: [
			App.api_url + '/card/',
			App.api_url + '/card/:action/',
		],

		model: App.Models.Card,

		comparator: function(model) {
			return model.get('number');
		}
	});

};
