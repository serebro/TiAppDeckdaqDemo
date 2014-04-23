// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

/* Branching logic based on OS */
var osname = Ti.Platform.osname;
var os = function(/*Object*/ map) {
	var def = map.def || null; //default function or value
	if (map[osname]) {
		return typeof map[osname] == 'function' ? map[osname]() : map[osname];
	} else {
		return typeof def == 'function' ? def() : def;
	}
};


// Facebook
var fb = require('facebook');
fb.addEventListener('login', function(e) {
	Ti.App.fireEvent('facebook:login', e);
});
fb.addEventListener('logout', function(e) {
	Ti.App.fireEvent('facebook:logout', e);
});
Alloy.Globals.Facebook = fb;


// Backbone
var Backbone = require('backbone');


var fn = function(){};