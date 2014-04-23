module.exports = function(_, Backbone, App){
	App.Models.Inventory = Backbone.Model.extend({
		_name: 'App.Models.Inventory'
	});

	App.Collections.Inventory = Backbone.Collection.extend({
		_name: 'App.Collections.Inventory',
		urlRoot: [App.api_url + '/inventory/v2/'],
		model: App.Models.Inventory,

		initialize: function() {
		},

		parse: function(resp) {
			if (!resp.success) {
				return [];
			}

			var card, packs = [], in_albums = {}, in_friends = {}, in_decks = {}, ext_attrs, cardModel,
				in_market = {__group: 'Market', id: 'market', items: []};

			resp.user_decks = resp.user_decks || [];
			App.user.decks.reset({items: resp.user_decks}, {silent: false, parse: App.user.decks.parse});

			resp.user_cards = resp.user_cards || [];
			App.user.cards.reset({items: resp.user_cards}, {silent: false, parse: App.user.cards.parse});

			App.user.decks.each(function(userDeck) {
				if (!in_decks[userDeck.get('album_id')]) {
					in_decks[userDeck.get('album_id')] = [];
				}
				userDeck.attributes = _.extend({}, App.storeDecks.get(userDeck.get('deck_id')).attributes, userDeck.attributes);
			});

			App.user.decks.sort();
			App.user.decks.each(function(userDeck) {
				in_decks[userDeck.get('album_id')].push(userDeck);
			});

			App.user.cards.each(function(userCard){
				card = App.cards.get(userCard.attributes.card_id);
				if (card) {
					if (userCard.attributes.place === App.Models.UserCard.prototype.PLACE_MARKET) {
						in_market.items.push(userCard);
					} else if (userCard.attributes.place === App.Models.UserCard.prototype.PLACE_FREE) {
						if (userCard.attributes.friend_id){
							if (!in_friends[userCard.attributes.friend_id]) {
								in_friends[userCard.attributes.friend_id] = [];
							}
							in_friends[userCard.attributes.friend_id].push(userCard);
						} else {
							if (!in_albums[userCard.attributes.album_id]) {
								in_albums[userCard.attributes.album_id] = {};
								in_albums[userCard.attributes.album_id].albumModel = App.albums.get(userCard.attributes.album_id);
								in_albums[userCard.attributes.album_id].cards = [];
							}
							in_albums[userCard.attributes.album_id].cards.push(userCard);
						}
					}
				} else {
					qbaka.report('User card #' + userCard.id + ' (card_id#' + userCard.get('card_id') + ') not found!');
					App.console.warn('User card #%s (card_id#%s) not found!', userCard.id, userCard.get('card_id'));
				}
			});

			App.user.albums.each(function(userAlbum){
				if (in_albums[userAlbum.attributes.album_id] === undefined) {
					in_albums[userAlbum.attributes.album_id] = {};
					in_albums[userAlbum.attributes.album_id].albumModel = App.albums.get(userAlbum.attributes.album_id);
					in_albums[userAlbum.attributes.album_id].cards = [];
				}
			});

			packs.push(in_market);

			_.each(in_decks, function(userDecks, album_id){
				packs.push({__group: 'Decks', id: 'unopened_' + album_id, name: userDecks[0].attributes.album.name, items: userDecks});
			});

			var friends = App.user.friends;
			_.each(in_friends, function(userCards, friend_id){
				var friendModel = friends.get(userCards[0].attributes.friend_id);
				if (friendModel) {
					packs.push({__group: 'Friend', id: friend_id, name: friendModel.attributes.first_name, social_id: friendModel.attributes.social_id, items: userCards});
				} else {
					packs.push({__group: 'Friend', id: friend_id, name: 'Unknown', social_id: '1', items: userCards});
				}
			});

			_.each(in_albums, function(item, album_id){
				packs.push({__group: 'Album', id: album_id, name: item.albumModel.attributes.name, items: item.cards});
			});

			return packs;
		}
	});

};
