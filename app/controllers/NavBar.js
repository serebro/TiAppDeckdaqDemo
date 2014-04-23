exports.baseController = 'Base';
var App = Alloy.Globals.App;
var self = this;
var container = this.getView();
var is_show_menu = false;

var hide = function(cb){
	App.sound('area close');
	self.anim(container, {left: '100%'}, self.ui.hide, function() {
		self.getView('title').text = '';
		self.trigger('hide');
		_.isFunction(cb) && cb();
	});
};

var hideMenu = function(cb) {
	App.sound('area close');
	is_show_menu = false;
	self.anim($.drawer, {left: 0}, self.ui.show, function(){
		_.isFunction(cb) && cb();
	});
};

App.user.on('change:name', function(user){
	var sections = self.getView('sideMenu').data;
	var rows = sections[0].getRows();
	var row = rows[0];
	row.setTitle(user.get('name'));
});

$.back.addEventListener('click', function(){
	App.sound('general click');
	self.trigger('back');
	self.hide();
});

$.menu.addEventListener('click', function(){
	App.sound('general click');
	self.trigger('menu', is_show_menu);
	is_show_menu ? self.hideMenu() : self.showMenu();
});



exports.show = function(title, view, cb) {
	//App.console.log(self.getView('view').children.length);
	App.sound('openArea open');
	title = title || self.getView('title').text || '';
	self.getView('title').text = title;
	_.each(self.getView('view').children, function(childView){
		childView.visible = childView == view;
	});

	self.anim(container, {left: 0}, self.ui.show, function(){
		self.trigger('show');
		_.isFunction(cb) && cb();
	});
};

exports.hide = hide;

exports.showMenu = function(cb){
	App.sound('openArea open');
	is_show_menu = true;
	self.anim($.drawer, {left: '-80%'}, self.ui.show, function(){
		_.isFunction(cb) && cb();
	});
};

exports.hideMenu = hideMenu;

$.sideMenu.addEventListener('click', function(e) {
//	var index = e.index;
//	var section = e.section;
//	var row = e.row;
//	Ti.API.info('detail ' + e.detail);
//	var msg = 'row ' + row + ' index ' + index + ' section ' + section + ' row data ' + row + ' row.id ' + row.id;
//	if (islongclick) {
//		msg = "LONGCLICK " + msg;
//	}
//	Ti.UI.createAlertDialog({title: 'Table View', message: msg}).show();
	switch(e.row.id) {
		case 'username':
		case 'sound':
			break;
		case 'logout':
			App.sound('general click');
			hideMenu();
			hide(function(){
				App.logout();
			});
			break;
		case 'lobby':
			App.sound('general click');
			hideMenu();
			hide();
			break;
		default:
			App.sound('general click');
			hideMenu();
			App.router.navigate(e.row.id);
	}

});
