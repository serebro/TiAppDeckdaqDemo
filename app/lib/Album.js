module.exports = function(_, Backbone, App){
	App.Models.Album = Backbone.Model.extend({
		_name: 'App.Models.Album',
		urlRoot: [
			App.api_url + '/album/:id/',
			App.api_url + '/album/:id/:action/',
		],

		/**
		 * @returns {string}
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
			return size + ' b-album-' + frame_class + size + rank_class;
		},

		/**
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

		getMaxUpgradeCards: function() {
			var rule = this.get('rules').where({type: 'UpgradeCard'});
			return rule.length ? rule[0].get('max_count') : 0;
		},

		/**
		 * @param {App.Models.User} user
		 * @param {string} size
		 * @returns {string}
		 */
		getOwnedClass: function(size, user) {
			user = user || App.user;
			var userAlbum = user.albums.getByAlbumId(this.id);
			return userAlbum ? userAlbum.getOwnedClass(size) : '';
		},

		/**
		 * Get page number of album by card
		 * @param card {App.Models.Card}
		 * @return {Number}
		 */
		getPageByCard: function(card) {
			if (card.get('album_id') !== this.id) {
				return 0;
			}
			return this.findPage(card.id).order;
		},

		/**
		 * @param {String} card_id
		 * @return {Boolean}
		 */
		isUpgradeableCard: function(card_id) {
			return this.getUpgradeableCards().indexOf(card_id) > -1;
		},

		findPage: function(card_id) {
			var page, placeholder;
			page = _.find(this.get('pages'), function(page) {
				placeholder = _.find(page.placeholders, function(ph) {
					return ph.cards.indexOf(card_id) > -1;
				});
				return !!placeholder;
			});
			return page;
		},

		/**
		 * @returns {Array|boolean}
		 */
		findPlaceholder: function(card_id) {
			var page, placeholder;
			page = _.find(this.attributes.pages, function(page) {
				placeholder = _.find(page.placeholders, function(ph) {
					return ph.cards.indexOf(card_id) > -1;
				});
				return !!placeholder;
			});
			return placeholder || !!page;
		},

		/**
		 * @param {Number} ph_order
		 * @returns {Array|boolean}
		 */
		findPlaceholderByOrder: function(ph_order) {
			var page, placeholder = null;
			page = _.find(this.get('pages'), function(page) {
				placeholder = _.find(page.placeholders, function(ph) {
					return Number(ph.order) === ph_order;
				});
				return !!placeholder;
			});
			return placeholder || !!page;
		},

		buy: function(user, opt) {
			this.fetch({
				params: {
					action: 'buy',
					buy_token: App.user.get('buy_token')
				},
				success: function(model, resp) {
					model.trigger('buy', resp);
					if (opt.success) {
						opt.success(model, resp);
					} else {
						user.albums.trigger('buy', model, resp); // todo: need???
					}
				},
				error: !opt.error ? App.ajax.errorHandler : function(model, resp, options){
					resp = JSON.parse(resp.responseText);
					//qbaka.report('Album buy: ' + resp.responseText);
					opt.error(model, resp, options);
				}
			});
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp);
			var album = resp.album ? resp.album : resp;

			var sample_cards = [];
			_.each(album.sample_cards, function(card){
				sample_cards.push(new App.Models.Card(card));
			});
			album.sample_cards = sample_cards;
			album.rules = new App.Collections.Rules(album.rules);
			return album;
		}
	});

	App.Collections.Albums = Backbone.Collection.extend({
		_name: 'App.Collections.Albums',
		urlRoot: [
			App.api_url + '/album/',
		],
		model: App.Models.Album,
		
		parse: function(resp){
			return resp.items ? resp.items : resp;
		}
	});
};
