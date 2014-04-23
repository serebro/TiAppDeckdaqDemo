module.exports = function(_, Backbone, App){
	App.Models.UserAction = Backbone.Model.extend({
		_name: 'App.Models.UserAction',
		urlRoot: [
			App.api_url + '/useraction/:id/',
			App.api_url + '/useraction/:id/:action/',
		],

		isLocked: function() {
			return this.get('params').is_locked;
		},

		/**
		 * @returns {boolean}
		 */
		isAllow: function() {
			if (this.isLocked()) {
				return false;
			}

			switch(this.get('model')) {
				case 'ActionBuyCard':
					return this.get('params').count > this.get('counters').count;
				case 'ActionSellBack':
					return this.get('params').coins > 0;
//				case 'ActionCollectorBonus':
//					return this.get('counters').seconds < 1 && App.user.get('bonus_reserve') > 0;
				case 'ActionBuyDeck':
				case 'ActionFriendAsk':
				case 'ActionFriendGive':
				case 'ActionFriendSell':
						if (this.get('params').count > 0) {
							if (this.get('counters').count < this.get('params').count) {
								return true;
							}

							return (this.get('counters').seconds === 0 || this.get('refreshed').getTime() + (this.get('counters').seconds * 1000) < (new Date().getTime()));
						} else {
							return false;
						}
				case 'ActionSellOnMarket':
					var count_cards = App.user.cards.where({place: App.Models.UserCard.prototype.PLACE_MARKET}).length;
					return this.get('params').limit_cards > count_cards;
			}

			return false;
		},

		parse: function(resp) {
			resp = Backbone.Model.prototype.parse(resp);
			return resp && resp.data ? resp.data : resp;
		}
	});

	App.Collections.UserActions = Backbone.Collection.extend({
		_name: 'App.Collections.UserActions',

		urlRoot: [
			App.api_url + '/useraction/',
			App.api_url + '/useraction/:action/',
		],

		model: App.Models.UserAction,
		changed_ids: [],

		getByName: function(action_name) {
			return this.find(function(userAction) {
				return userAction.get('model') === action_name;
			});
		}
	});
};
