exports.baseController = 'Base';
var App = Alloy.Globals.App;
var self = this;
var container = this.getView();
var is_show = false;
var is_show_albums = true;

var $switchToAlbums = $.switchToAlbums;
var $switchToDecks = $.switchToDecks;

$switchToAlbums.left = Ti.Platform.displayCaps.platformWidth / 2 - 120;
$switchToAlbums.addEventListener('click', function(){
	App.console.log('click switchToAlbums');
	$switchToDecks.enabled = true;
	//$switchToDecks.focusable = true;
	$switchToAlbums.enabled = false;
	//$switchToAlbums.focusable = false;
	$.shelvesContainer.scrollToView(0);
});
$.switchToDecks.addEventListener('click', function(){
	App.console.log('click switchToDecks');
	$switchToDecks.enabled = false;
	//$switchToDecks.focusable = false;
	$switchToAlbums.enabled = true;
	//$switchToAlbums.focusable = true;
	$.shelvesContainer.scrollToView(1);
});

$.shelvesContainer.addEventListener('scrollend', function(e){
	$switchToDecks.enabled = e.currentPage == 0;
	$switchToAlbums.enabled = e.currentPage == 1;
});

App.navBarController.getView('view').add(container);

App.albums.on('reset', function() {
	var shelf;
	var top = 'shelf-first';
	$.frameAlbums.removeAllChildren();
	App.albums.each(function(album, i){
		var idx = i + 1;
		var is_last = idx % 2 === 0;

		if (!is_last) {
			shelf = Ti.UI.createView();
			$.addClass(shelf, ['shelf-album', top]);
		}

		var wAlbum = new Alloy.createWidget('album', {album: album, size: 'small'});
		var wAlbumView = wAlbum.getView();
		wAlbumView.id = album.id;

		var albumCont = Ti.UI.createView();
		shelf.add(albumCont);

		var size = wAlbum.getFrameSizes('small');
		var side = is_last ? 'right' : 'left';
		$.addClass(albumCont, ['album', side]);
		albumCont.width = size.w;
		albumCont.height = size.h;
		albumCont.add(wAlbumView);
		albumCont.addEventListener('click', onClickAlbum);

		if (is_last || App.albums.length - 1 === i) {
			var glass = Ti.UI.createView();
			$.addClass(glass, 'glass');
			shelf.add(glass);
			$.frameAlbums.add(shelf);
			top = 'shelf-other';
		}
	});
});

App.decks.on('reset', function() {
	var shelf;
	$.frameDecks.removeAllChildren();
	App.decks.each(function(deck, i){
		var idx = i + 1;
		var is_last = idx % 2 === 0;

		if (!is_last) {
			shelf = Ti.UI.createView();
			$.addClass(shelf, 'shelf-deck');
		}

		var wDeck = new Alloy.createWidget('deck', {deck: deck, size: 'normal'});
		var wDeckView = wDeck.getView();
		wDeckView.id = deck.id;

		var deckCont = Ti.UI.createView();
		shelf.add(deckCont);

		var size = wDeck.getFrameSizes('normal');
		var side = is_last ? 'right' : 'left';
		$.addClass(deckCont, ['deck', side]);
		deckCont.width = size.w;
		deckCont.height = size.h;
		deckCont.add(wDeckView);
		deckCont.addEventListener('click', onClickDeck);

		if (is_last || App.decks.length - 1 === i) {
			$.frameDecks.add(shelf);
		}
	});
});


exports.show = function(cb) {
	is_show = true;
	App.navBarController.show('STORE', container, cb);
	App.navBarController.off('hide', hide);
	App.navBarController.on('hide', hide);
};

exports.hide = function(cb){
	App.navBarController.hide(function(){
		hide(cb);
	});
};

var hide = function(cb){
	App.console.log('hide Store');
	App.navBarController.off('hide', hide);
	is_show = false;
	_.isFunction(cb) && cb();
};

var onClickAlbum = function(e){
	App.console.log(e.source.model_id);
	var album = App.albums.get(e.source.model_id);
	alert(album.get('name'));
};

var onClickDeck = function(e){
	App.console.log(e.source.model_id);
	var deck = App.decks.get(e.source.model_id);
	alert(deck.get('name'));
};

//var openAlbums = function(){
//	if (!is_show_albums) {
//		App.sound('openArea open');
//		self.anim($.shelvesContainer, {left: 0}, {duration: 200});
//		is_show_albums = true;
//	}
//};
//
//var openDecks = function(){
//	if (is_show_albums) {
//		App.sound('openArea open');
//		self.anim($.shelvesContainer, {left: -Ti.Platform.displayCaps.platformWidth}, {duration: 200});
//		is_show_albums = false;
//	}
//};
