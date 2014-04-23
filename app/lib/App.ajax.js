var ajax = require('ajax');

module.exports = {
	is_error: false, // if false then show common ajax error alert
	is_stop_requests: false, // stop all request after session expired

	ERR_TRANSACTION_ERROR: 1,
	ERR_ID_NOT_VALID: 2,
	ERR_NOT_FOUND: 3,
	ERR_NOT_OWNED: 4,
	ERR_ALREADY_PURCHASED: 5,

	ERR_BUY_TOKEN_NOT_VALID: 305,
	ERR_BUY_TOKEN_EXPIRED: 306,
	ERR_COINS_NOT_ENOUGH: 103,
	ERR_CASH_NOT_ENOUGH: 111,
	ERR_USER_IS_BLOCKED: 112,

	ERR_PLACE_CARD_NOT_MARKET: 201,
	ERR_CARD_NOT_OWNED: 202,
	ERR_CARD_NOT_ON_MARKET: 209,
	ERR_CARD_PRICE_HIGHER: 210,
	ERR_CARDS_SWAP_NOT_EQUAL: 214,
	ERR_CARDS_NOT_SWAP: 215,

	ERR_BUY_LIMIT_DECK: 301,
	ERR_COUNT_NOT_VALID: 302,

	errorAuth: function(event, jqXHR/*, ajaxSettings, thrownError*/) {
		if (App.ajax.is_error) {
			return;
		}
		App.ajax.is_error = true;
//		$('#lobbyInfobar').css({zIndex: 98});
//		var msg = _.isEmpty(jqXHR.responseText) ? jqXHR.statusText : 'Error: ' + jqXHR.responseText;

//		App.trackEvent('JS Error', 'Ajax Error:' + msg, 'Auth');

//		if (/auth|token/.test(msg)) {
//			$.wait('hide');
//			App.ajax.is_stop_requests = true;
//			if (App.ui.dialog) {
//				App.ui.dialog.show = App.ui.dialog.hide = 500;
//			}
//			var helper = new App.Views.Dialog({
//				cls: 'info',
//				title: 'info',
//				attrs: {style: 'z-index: 1000'},
//				content: '<div class="subtitle">Oops. Looks like you have been logged out...</div><div class="text" style="text-align: center;margin-top: 40px;">Click "Reload" to fix this.</div>',
//				onCancel: function() {},
//				buttons: [{
//					text: 'Reload',
//					cls: 'b-btn-dialog b-btn-dialog-green',
//					click: function() {
//						var win = top ? top : window;
//						win.location.href = App.settings.social.url;
//					}
//				}]
//			});
//			helper.show();
//			App.console.warn(msg, jqXHR);
//		}
	},

	errorHandler: function(model, resp, options) {
//		$.wait('hide');
//		App.console.warn(model, resp, options);
//		try {
//			var r = JSON.parse(resp.responseText);
//			resp = r;
//		} catch(e) {}
//
//		var message, button, fn;
//		if (resp.errors && resp.errors[0] && resp.errors[0].message) {
//			message = '<div class="subtitle">' + resp.errors[0].message + '</div>';
//			button = 'Close';
//			fn = function() {this.hide();};
//		} else {
//			message = '<div class="subtitle">There\'s a problem but you can fix it.</div><div class="text" style="text-align: center;margin-top: 100px;">Click the "Fix" button.</div>';
//			button = 'Fix';
//			fn = function() {
//				var win = top ? top : window;
//				win.location.href = App.settings.social.url;
//			};
//		}
//
//		App.trackEvent('JS Error', 'Ajax Error:' + message, 'Handler');
//
//		(new App.Views.Dialog({
//			cls: 'info',
//			title: 'info',
//			content: message,
//			buttons: [{
//				text: button,
//				cls: 'b-btn-dialog b-btn-dialog-green',
//				click: fn
//			}]
//		})).show();
//		App.console.warn(resp);
	},

	hasErrorCode: function(resp, code) {
		if (resp.responseText) {
			resp = JSON.parse(resp.responseText);
		}
		if (resp.success || !_.isArray(resp.errors)) {
			App.console.warn('Not error!', resp);
			return false;
		}

		return _.find(resp.errors, function(item) {
			return item.code && item.code === code;
		});
	},

	// jQuery-like aliases
	request: ajax.ajax,
	param: ajax.param,
	get: ajax.get,
	post: ajax.post,
	getJSON: ajax.getJSON
};
