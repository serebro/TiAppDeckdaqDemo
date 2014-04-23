var App = Alloy.Globals.App;

App.user.on('change', function(user){
	$.coinsCounter.text = user.get('coins');
});


$.buildId.setText('v. ' + Alloy.CFG.buildId);
$.buildId.addEventListener('click', function(){
	App.alert();
});

$.store.addEventListener('click', function(){
	App.sound('general click');
	App.router.navigate('store');
});

$.inventory.addEventListener('click', function(){
	App.sound('general click');
	App.router.navigate('inventory');
});

$.albums.addEventListener('click', function(){
	App.sound('general click');
	App.router.navigate('albums');
});

