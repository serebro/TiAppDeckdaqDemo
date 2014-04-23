exports.baseController = 'Base';
var App = Alloy.Globals.App;
var self = this;
var container = this.getView();
var is_show = false;
var scroll = self.getView('scroll');

App.navBarController.getView('view').add(container);

exports.show = function(cb) {
	App.navBarController.show('INVENTORY', container, cb);
	if (is_show) {
		return;
	}
	is_show = true;
	container.visible = true;
	render();
	scroll.currentPage = 0;
	App.navBarController.off('hide', hide);
	App.navBarController.on('hide', hide);
};

exports.hide = function(cb){
	App.navBarController.hide(function(){
		hide(cb);
	});
	App.navBarController.off('hide', hide);
};

var hide = function(cb){
	App.console.log('hide Inventory');
	is_show = false;
	App.navBarController.off('hide', hide);
	_.each(scroll.views, function(view){
		view.parent.removeAllChildren();
	});
	scroll.views = [];
	container.visible = false;
	_.isFunction(cb) && cb();
};

var render = function(){
	App.console.log('render cards Inventory');
	//App.console.time('inventory render');
	var views = [];
	var wCard;
	var limit = 19;
	var albums = App.cards.where({album_id: '4fe5a404edbfd6f851000002'}).slice(0, 6);
	albums = _.union(albums, App.cards.where({album_id: '50226be4edbfd60540000014'}).slice(0, 6));
	albums = _.union(albums, App.cards.where({album_id: '50c21245330e3e4cb48701bc'}).slice(0, 6));
	_.each(albums.slice(0, 19), function(card){
		//App.console.log('InventoryCard ' + card.get('name'));
		var view = Titanium.UI.createView();
		$.addClass(view, 'pack');
		wCard = new Alloy.createWidget('card', {card: card, size: 'big'});
		view.add(wCard.getView());
		views.push(view);
	});
	//alert('Inventory render ' + limit + ' cards: ' + App.console.timeEnd('inventory render'));
	scroll.showPagingControl = views.length < 20;
	scroll.views = views;
};
