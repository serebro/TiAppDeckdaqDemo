//A.Backbone.sync = require('ti_rest').sync

module.exports = function(_, Backbone, App){
	App.Models.User = Backbone.Model.extend({
		_name: 'App.Models.User',
		allow_change_attrs: ['is_music', 'is_sound', 'is_upgrade_tooltip_shown', 'is_send_gift', 'permissions'],
		defaults: {
			friends_invited: []
		},
		urlRoot: [
			App.api_url + '/user/:id/',
			App.api_url + '/user/:id/:action/'
		],
		changes: [],
		orderFields: ['points', 'level', 'BrandCoupon', 'Badge', 'Album', 'CoinsAlbum', 'UpgradeAlbum', 'PrizeSimple', 'coins', 'cash'],

		// collections

		/** @type {App.Collections.Album} */
		albums: null,

		/** @type {App.Collections.Deck} */
		decks: null,

		unlocks: null,
		badges: null,
		actions: null,
		requests: null,

		/** @type {App.Collections.Card} */
		cards: null,

		/** @type {App.Collections.Friend} */
		friends: null,

		/**
		 * @type {Number}
		 * @private
		 */
		_timer_for_refresh: 0,

		_auto_refresh_count: 0,

		/**
		 * @type {Number}
		 * @public
		 */
		ticker: 0,

		initialize: function() {
			_.bindAll(this);
		},

		initCurrentUser: function() {
			App.console.log('initCurrentUser User');
			var self = this;

			//Set currency to default in case we don't get it from FB in time.
			this.set({
				currency: {
					currency_exchange: 10,
					currency_exchange_inverse: 0.1,
					currency_offset: 100,
					user_currency: 'USD'
				}
			});

			this.decks = new App.Collections.UserDecks({user: this});
			this.unlocks = new App.Collections.UserUnlocks({user: this});
			this.albums = new App.Collections.UserAlbums({user: this});
			this.cards = new App.Collections.UserCards({user: this});
			this.friends = new App.Collections.Friend({user: this});
			this.inventory = new App.Collections.Inventory();
			this.actions = new App.Collections.UserActions({user: this});
			this.requests = new App.Collections.UserRequests({user: this});

//			setInterval(this.calcPower, 1000 * 60 * 60 * 30);

			this.on('change', this.onReset);
			this.on('change:friends_invited', this.onChangeFriendsInvited);
	//		this.friends.on('add reset', this.onChangeFriendsInvited);
		},

		/**
		 * @return {String} Url
		 */
		getImage: function() {
			return App.getProfileImage(this.get('social_id'));
		},

		collectBonus: function() {
			this.fetch({
				params: {action: 'collectbonus'},
				success: function(model, resp) {
					model.trigger('collectBonus', resp);
				},
				error: App.ajax.errorHandler
			});
		},

		recordTutStep: function(tutorial_step) {
			return this.fetch({
				params: {action: 'recordtutstep', tutstep: tutorial_step},
				success: function(model, resp) {
					model.trigger('recordTutStep', resp);
				},
				error: App.ajax.errorHandler
			});
		},

		recordP2pTut: function(value) {
			this.fetch({
				params: {action: 'recordp2ptut', value: value},
				success: function(model, resp) {
					model.trigger('recordP2pTut', resp);
				},
				error: App.ajax.errorHandler
			});
		},

		calcPower: function(cb){
			this.urlParams = {action: 'calcpower'};
			App.ajax.getJSON(this.url(), cb);
			this.urlParams = {};
		},

		sync: function(method, model, options) {
			if (method === 'update') {
				var changes, diff = {};
				changes = model.changedAttributes();
				for(var attr in changes) {
					if (changes.hasOwnProperty(attr) && this.allow_change_attrs.indexOf(attr) > -1) {
						diff[attr] = model.attributes[attr];
					}
				}
				diff.is_sound = model.attributes.is_sound;
				diff.is_music = model.attributes.is_music;
				diff.permissions = model.attributes.permissions;
				model.changed = diff;
			}
			return Backbone.sync.call(this, method, model, options);
		},

		diff: function() {
			this.changes = [];

			var self = this, prevAttributes = this.previousAttributes(), prevUnlocks = [];

			// Prepare plain array for previous unlocks ID
			_.each(prevAttributes.unlocks, function(unlock) {
				prevUnlocks.push(unlock.rule_id);
			});

			// find differences
			_.each(['points', 'coins', 'cash', 'level', 'is_music'], function(name) {
				// if differences by field
				if (self.attributes[name] !== undefined && (prevAttributes[name] === undefined || !_.isEqual(prevAttributes[name], self.attributes[name]))) {
					self.changes.push({type: 'diff', field: name, value: self.attributes[name], order: self.orderFields.indexOf(name)});
				}
			});

	//		// unlocks
	//		_.each(this.unlocks.changed_ids, function(unlock_id) {
	//			var unlock = self.unlocks.get(unlock_id);
	//			self.changes.push({type: unlock.get('model'), field: 'unlocks', value: unlock, order: self.orderFields.indexOf(unlock.get('model'))});
	//		});
	//		this.unlocks.changed_ids = [];
	//
	//		// actions
	//		_.each(this.actions.changed_ids, function(action_id) {
	//			var action = self.actions.get(action_id);
	//			self.changes.push({type: action.get('model'), field: 'actions', value: action, order: self.orderFields.indexOf(action.get('model'))});
	//		});
	//		this.actions.changed_ids = [];

			// sort by order for unlock popups
			this.changes.sort(function(a, b) {
				return a.order > b.order;
			});

			App.console.log('diff User', this.changes);
			if (!_.isEqual(this.changes, [])) {
				this.trigger('change:diff', this.changes);
			}
		},

		/**
		 * Fetch user social data from facebook
		 * @param FB
		 * @param {function(Array:perms)} cb
		 */
		fetchSocialData: function() {
			App.console.log('fetchSocialData User');
	//		var self = this;
	//		setTimeout(function() {
	//					FB.api('/me/?fields=id,name,currency,first_name,permissions,gender,last_name,link,third_party_id', function(resp) {
	//						if (resp && resp.id) {
	//							App.user.set({
	//								currency: resp.currency,
	//								link: resp.link,
	//								third_party_id: resp.third_party_id
	//							});
	//							if (!App.user.get('permissions').installed) {
	//								App.user.set({permissions: resp.permissions.data[0]});
	//								App.user.save('permissions', resp.permissions.data[0], {only_changes: true, silent: true});
	//							}
	//
	//							self.trigger('fetchSocialData');
	//						}
	//					});
	//				}, 1000);
		},

		onChangeFriendsInvited: function() {
			var friends_invited = this.get('friends_invited');
			App.console.log('onChangeFriendsInvited User', friends_invited);
	//		this.friends.each(function(friend) {
	//			friend.set({is_invited: friends_invited.indexOf(friend.get('social_id')) > -1});
	//		});
		},

		startAutoRefresh: function() {
			this._auto_refresh_count--;
			if (this._auto_refresh_count <= 0) {
				this._auto_refresh_count = 0;
				App.console.log('startAutoRefresh User');
				var self = this;
				clearInterval(this._timer_for_refresh);
//				this._timer_for_refresh = setInterval(function() {
//					App.console.log('autoRefresh User', self._timer_for_refresh);
//					self.fetch();
//				}, 50 * 1000);
				App.console.log('startAutoRefresh with intervalID:', this._timer_for_refresh);
			}
		},

		stopAutoRefresh: function() {
			if (this._auto_refresh_count === 0) {
				App.console.log('stopAutoRefresh User', this._timer_for_refresh);
				clearInterval(this._timer_for_refresh);
			}
			this._auto_refresh_count++;
		},

		onReset: function() {
			App.ticker = 0; // todo: need check
		},

		updateFriends: function(options) {
	//		var friendsCollection = this.friends;
	//		var self = this;
	//
	//		options = options ? _.clone(options) : {};
	//		if (options.parse === undefined) {
	//			options.parse = true;
	//		}
	//
	//		var success = options.success;
	//		options.success = function(resp) {
	//			friendsCollection.reset(resp, options);
	//			if (success) {
	//				success(friendsCollection, resp);
	//			}
	//		};
	//
	//		var friends_filter = friendsCollection.length ? ' AND NOT (uid2 IN (' + friendsCollection.pluck('social_id').join(',') + '))' : '';
	//		var query = 'SELECT uid, is_app_user FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = ' + this.get('social_id') + friends_filter + ') AND is_app_user = 1';
	//		var force_get_friends = true;
	//		FB.api({method: 'fql.query', query: query}, function(resp) {
	//			if (resp.length) {
	//				var new_friends = [];
	//				_.each(resp, function(item) {
	//					if (!friendsCollection.where({social_id: item.uid}).length) {
	//						new_friends.push(item.uid);
	//					}
	//				});
	//
	//				if (new_friends.length) {
	//					force_get_friends = false;
	//					friendsCollection.urlParams = {action: 'add'};
	//					$.post(friendsCollection.url(), {social_id: new_friends.join(',')}, function(resp) {
	//						options.success(resp);
	//					});
	//					friendsCollection.urlParams = {};
	//				}
	//			}
	//			if (force_get_friends) {
	//				$.get(friendsCollection.url(), function(resp) {
	//					options.success(resp);
	//				});
	//			}
	//
	//			self.fetchNotInSysFriends();
	//		});
		},

		fetchNotInSysFriends: function() {
	//		var friendsCollection = this.friends;
	//		var query = 'SELECT uid, is_app_user, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = ' + this.get('social_id') + ') AND is_app_user = 0 LIMIT 50';
	//		FB.api({method: 'fql.query', query: query}, function(resp) {
	//			if (resp.length) {
	//				// delete random friends
	//				while(resp.length > 10) {
	//					resp.splice(Math.rand(0, resp.length), 1);
	//				}
	//				_.each(resp, function(item) {
	//					item.id = '';
	//					item.social_id = item.uid;
	//					delete item.uid;
	//					delete item.is_app_user;
	//				});
	//
	//				friendsCollection.add(resp, {});
	//			}
	//		});
		},

		parse: function(resp) {
			this.refreshed = new Date();
			return resp && resp.data ? resp.data : resp;
		}
	});

//	App.Models.UserArenaStats = Backbone.Model.extend({
//		_name: 'App.Models.UserArenaStats',
//		urlRoot: [
//			App.api_url + '/user/:id/arenastats/'
//		]
//	});

//	App.Collections.UserArenaCards = Backbone.Collection.extend({
//		_name: 'App.Models.UserArenaCards',
//		urlRoot: [
//			App.api_url + '/user/arenacards/'
//		],
//
//		parse: function(resp) {
//			resp.items = _.map(resp.items, function(item){
//				return App.cards.get(item.id);
//			});
//			return resp.items;
//		}
//	});
};
