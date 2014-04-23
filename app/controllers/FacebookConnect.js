var App = Alloy.Globals.App;
var self = this;

var onLogin = function(e){
    if (e.success) {
        $.getView().close();
    } else if (e.error) {
        alert(e.error);
    } else if (e.cancelled) {
        alert('Canceled');
    }
};

var onLogout = function(e){
	Ti.App.removeEventListener('facebook:logout', onLogout);
	Ti.App.removeEventListener('facebook:login', onLogin);
    //alert('Logged out');
	self.run();
};

$.login.on('click', function(){
	App.wait.show();
    var fb = Alloy.Globals.Facebook;
    fb.appid = Alloy.CFG.app_id;
    fb.permissions = [];
    fb.forceDialogAuth = Alloy.CFG.forceDialogAuth;
    fb.authorize();
	self.run();
});


exports.run = function(){
    if (Alloy.Globals.Facebook.loggedIn) {
        Ti.App.addEventListener('facebook:logout', onLogout);
    } else {
        var fbConnectView = $.getView();
        fbConnectView.open();
        Ti.App.addEventListener('facebook:login', onLogin);
    }
};
