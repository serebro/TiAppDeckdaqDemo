exports.baseController = 'Base';
var App = Alloy.Globals.App;
var self = this;
var container = this.getView();
var scroll = self.getView('scroll');
var PageFlip = require('ti.pageflip');
var albums_widgets = [];
var pageFlipContainer = this.getView('pageFlipContainer');
var pageFlip = null;
var is_show = false;
var is_opened_album = false;
var albumLargeSizes = {};
var albumNormalSizes = {};

App.navBarController.getView('view').add(container);

exports.show = function(cb) {
	App.console.log('show Albums');
	App.navBarController.show('MY ALBUMS', container, cb);
	App.navBarController.off('hide', hide);
	App.navBarController.on('hide', hide);
	if (is_show) {
		return;
	}
	scroll.visible = true;
	render();
	scroll.currentPage = 0;
};

exports.hide = function(cb){
	App.navBarController.hide(function(){
		hide(cb);
	});
};

var hide = function(cb){
	App.console.log('hide Albums');
	App.navBarController.off('hide', hide);
	is_show = false;
	closeAlbum();
	_.each(scroll.views, function(view){
		view.parent.removeAllChildren();
	});
	scroll.views = [];
	_.isFunction(cb) && cb();
};

var render = function(){
	App.console.log('render Albums');
	var views = [];
	var wAlbum;
	var limit = 19;
	_.each(App.albums.models, function(album){
		var view = Ti.UI.createView();
		$.addClass(view, 'pack');
		var label = Ti.UI.createLabel({id: 'name', text: album.get('name')});
		$.addClass(label, 'name');

		wAlbum = new Alloy.createWidget('album', {album: album, size: 'normal'});
		var wAlbumView = wAlbum.getView();
		$.addClass(wAlbumView, 'album');

		view.add(label);
		view.add(wAlbumView);
		views.push(view);
	});
	albumLargeSizes = wAlbum.getFrameSizes('large');
	albumNormalSizes = wAlbum.getFrameSizes('normal');
	scroll.showPagingControl = views.length < 20;
	scroll.views = views;
};

var onFlip = function(e){
	App.console.log('onFlip Albums');
	/*
		e.bubbles = 1;
		e.cancelBubble = 0;
		e.currentPage = 2;
		e.pageCount = 5;
		e.source = "[object pageFlip]";
		e.type = change;
	 */
	if (e.currentPage == 0) {
		closeAlbum();
	}
};

var onOpen = function(e){
	App.console.log('onOpen Albums', scroll.currentPage);
	is_opened_album = true;

	var pages = [];
//	App.albums.each(function(album){
//		var view = Ti.UI.createView();
//		$.addClass(view, 'page');
//		var wAlbum = new Alloy.createWidget('album', {album: album, size: 'large'});
//		view.add(wAlbum.getView());
//		pages.push(view);
//	});

	var view = Ti.UI.createView();
	$.addClass(view, 'page');
	var wAlbum = new Alloy.createWidget('album', {album: App.albums.at(scroll.currentPage), size: 'large'});
	view.add(wAlbum.getView());
	pages.push(view);

	var p = ['first_page.jpg', 'page_right1.jpg', 'page_right2.jpg', 'page_right3.jpg', 'last_page.png'];
	_.each(p, function(image){
		var view = Ti.UI.createView();
		$.addClass(view, 'page');
		view.backgroundImage = '/common/albums/' + image;
		pages.push(view);
	});

	pageFlip = PageFlip.createView({
		id: 'pageFlip',
		transitionDuration: 0.3,
		transition: PageFlip.TRANSITION_CURL,
		top: 20,
		left: -2,
		width: albumLargeSizes.w,
		height: albumLargeSizes.h,
		pages: pages
	});
	pageFlipContainer.add(pageFlip);


	var albumView = scroll.views[scroll.currentPage];
	var wAlbumView = albumView.children[1];
	wAlbumView.animate(Ti.UI.createAnimation({
		top: 20,
		left: -2,
		width: albumLargeSizes.w,
		height: albumLargeSizes.h,
		duration: 150
	}));


	setTimeout(function(){
		pageFlip.changeCurrentPage(1, false);
		pageFlip.changeCurrentPage(0, false);
		pageFlipContainer.visible = true;
		scroll.visible = false;
		pageFlip.changeCurrentPage(1, true);
		pageFlip.addEventListener('change', onFlip);
	}, 200);
};


var closeAlbum = function(cb){
	App.console.log('closeAlbum Albums', pageFlip, is_opened_album);
	if (!pageFlip) {
		return;
	}
	if (!is_opened_album) {
		return;
	}
	App.console.log('closeAlbum Albums');
	is_opened_album = false;
	scroll.visible = true;
	pageFlipContainer.visible = false;

	var albumView = scroll.views[scroll.currentPage];
	var wAlbumView = albumView.children[1];
	wAlbumView.animate(Ti.UI.createAnimation({
		top: 50,
		left: 28,
		width: albumNormalSizes.w,
		height: albumNormalSizes.h,
		duration: 150
	}));

	pageFlip.removeEventListener('change', onFlip);
	pageFlip.pages = [];
	pageFlip.removeAllChildren();
	pageFlip = null;
	pageFlipContainer.removeAllChildren();
	_.isFunction(cb) && cb();
};

scroll.addEventListener('singletap', onOpen);
