var App = Alloy.Globals.App = _.extend({}, Backbone.Events, {
	api_url: Alloy.CFG.request_domain + '/api',
	api_key: Alloy.CFG.api_key,
	requestTimeout: Alloy.CFG.requestTimeout,
	rsver: '',
	user: {},
	token: '',
	settings: {
		request_domain: Alloy.CFG.request_domain
	},

	// Namespaces
	Collections: {},
	Models: {},
	Views: {},

	activeControls: {},

	run: function(app_id, request_domain, platform) {
		_.bindAll(this);
		Backbone.emulateHTTP = true;
		Backbone.emulateJSON = false;
		Alloy.Globals.index = $.index;

//        var appQueue = new App.Queue();
//        this.queue = $.proxy(appQueue.add, appQueue);

		// Models
		this.user = new App.Models.User();
		this.albums = new App.Collections.Albums();
		this.badges = new App.Collections.Badge();
		this.inventory = new App.Collections.Inventory();
		this.cards = new App.Collections.Cards();
		this.decks = new App.Collections.Decks();
		this.market = new App.Collections.Market();
		this.rules = new App.Collections.Rules();

		// Controllers
		this.wait = Alloy.createController('Wait');
		this.wait.show();
		this.facebookConnect = Alloy.createController('FacebookConnect');
		this.lobbyController = Alloy.createController('Lobby');
		this.navBarController = Alloy.createController('NavBar');
		this.storeController = Alloy.createController('Store');
		this.albumsController = Alloy.createController('Albums');
		this.inventoryController = Alloy.createController('Inventory');
		this.lobbyController.getView().add(this.navBarController.getView());
		$.index.add(this.lobbyController.getView());
		$.index.open();

		this.on('auth', this.onAuth);
		this.on('afterAuth', this.onAfterAuth);
		Ti.App.addEventListener('facebook:login', this.onFbLogin);
		Ti.App.addEventListener('facebook:logout', this.onFbLogout);
		this.facebookConnect.run();
	},

	onFbLogin: function(e) {
		if (!e.success) {
			return;
		}

		var self = this;

//		Ti.App.Properties.setString('social_id', Alloy.Globals.Facebook.getUid());
//		Ti.App.Properties.setString('access_token', Alloy.Globals.Facebook.getAccessToken());
		//Ti.API.info(Alloy.Globals.Facebook.getAccessToken());

//		if (this.token) {
//			var userMe = Ti.App.Properties.getString('userMe');
//			if (userMe) {
//				userMe = JSON.parse(userMe);
//				if (userMe.success) {
//					this.user.set(userMe);
//					App.imageLoader(function(){
//						App.trigger('afterAuth');
//					});
//					return;
//				}
//			}
//
//		}

		App.ajax.request({
			url: App.api_url + '/auth/fb',
			timeout: App.requestTimeout,
			dataType: 'json',
			data: {
				access_token: Alloy.Globals.Facebook.getAccessToken(),
				api_key: App.api_key
			},
			success: function(resp){
				self.trigger('auth', resp);
			},
			error: function(resp){
				Ti.API.debug(e.error);
			}
		});
   },

	onFbLogout: function(e) {
//		Ti.App.Properties.setString('social_id', '');
//		Ti.App.Properties.setString('access_token', '');
		 //Ti.API.info(JSON.stringify(e)); {"cancelBubble":false,"bubbles":true,"type":"facebook:logout"}
	},

	imageLoader: function(cb){
		App.console.log('imageLoader App');
		var q = new App.Queue();

		q.add(function(next){
			App.user.cards.fetch({success: next});
		});

		q.add(function(next){
			App.decks.on('reset', function(decks){
				if (App.image.exists(decks.first(), 'normal')) {
					next();
				} else {
					App.image.decksDownload(decks, next);
				}
			});
			App.decks.fetch({success: next});
		});

		q.add(function(next){
			App.albums.on('reset', function(albums){
				if (App.image.exists(albums.first())) {
					next();
				} else {
					App.image.albumsDownload(albums, next);
				}
			});
			App.albums.fetch({params: {exclude: 'rules,pages'}, success: next});
		});

		q.add(function(next){
			App.cards.on('reset', function(cards){
				if (App.image.exists(cards.first())) {
					cb();
				} else {
					App.image.cardsDownload(cards, cb);
				}
			});
			App.cards.fetch();
		});
	},

	onAuth: function(resp) {
		App.console.log('onAuth App');
		this.token = resp.token;
		this.settings = resp.settings;
		//this.settings.places = new App.Collections.Rules(this.settings.places);
		this.user.set(resp.me);
		this.user.initCurrentUser();
//		this.user.on('change', this.user.diff);
//		this.user.fetchSocialData();
//		this.user.startAutoRefresh();
//		setInterval(function(){App.user.updateFriends();}, 5 * 60 * 1000); // todo:
		this.user.on('change', function(user){
			Ti.App.Properties.setString('userMe', JSON.stringify(user.attributes));
		});

		this.wait.hide();
		App.imageLoader(function(){
			App.trigger('afterAuth');
		});

	},

	onAfterAuth: function(){
		//alert('Fetch all cards: ' + App.console.timeEnd('cards'));
		//alert('First card from collection: ' + App.cards.first().get('name'));

//		var wDeck = new Alloy.createWidget('deck', {deck: App.decks.first(), size: 'normal'});
//		var wDeckView = wDeck.getView();
//		$.index.add(wDeckView);
	},

	loader: function(){
		// onOpen="App.loader"
		//$.logo.init({ image: '/images/alloy.png', width: 216, height: 200 });
		//alert('IndexOpen');
	},

	alert: function(){
		this.wait.show();
		setTimeout(function(){
			App.wait.hide();
		}, 3000);
//		App.sound('clickSubmit');
//
//		var card = new App.Models.Card({id: '4fe63d2b52e01f95267f7807'});
//		card.fetch({success: function(){
//			alert('Fetch one card: ' + card.get('name'));
//		}});
	},

	getProfileImage: function(social_id, type) {
		if (App.settings.social.index === 0) {
			// type - "square" 50x50, "small" 50px Wide Variable Height, "normal" - 100px Width Variable Height, "large" - 200px Wide Variable Height
			// https://developers.facebook.com/docs/reference/api/using-pictures/
			var sizes = ['square', 'small', 'normal', 'large'];
			if (type && sizes.indexOf(type) > -1) {
				type = '?type=' + type;
			} else if (type && (type.width || type.height)) {
				var p = [];
				p.push(type.width ? 'width=' + type.width : '');
				p.push(type.height ? 'height=' + type.height : '');
				type = '?' + p.join('&');
			} else {
				type = '';
			}
			return '//graph.facebook.com/' + social_id + '/picture/' + type;
		}

		return '';
	},

	getProfileLink: function(social_id) {
		if (App.settings.social.index === 0) {
			return '//www.facebook.com/' + social_id;
		}

		return '#';
	},

	logout: function(){
		Alloy.Globals.Facebook.logout();
		this.facebookConnect.run();
	}
});

App.console = require('App.console');
App.Queue = require('App.Queue');
App.ajax = require('App.ajax');
App.image = require('App.image')(_, Backbone, App);
App.sound = require('App.sound')(App);
App.router = require('App.router')(_, Backbone, App);

require('Backbone.sync')(_, Backbone, App);
require('Album')(_, Backbone, App);
require('Badge')(_, Backbone, App);
require('Card')(_, Backbone, App);
require('Deck')(_, Backbone, App);
require('Friend')(_, Backbone, App);
require('Inventory')(_, Backbone, App);
require('Market')(_, Backbone, App);
require('Order')(_, Backbone, App);
require('Rule')(_, Backbone, App);
require('UserAction')(_, Backbone, App);
require('UserAlbum')(_, Backbone, App);
require('UserCard')(_, Backbone, App);
require('UserDeck')(_, Backbone, App);
require('UserRequests')(_, Backbone, App);
require('UserUnlock')(_, Backbone, App);
require('User')(_, Backbone, App);



App.run(Alloy.CFG.app_id, Alloy.CFG.request_domain, Ti.Platform.name);
//Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_ANNOUNCEMENT, "Welcome to my App");
