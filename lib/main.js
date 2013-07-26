var widgets		=	require('sdk/widget');
var data		=	require('sdk/self').data;
var tabs		=	require('sdk/tabs');
var tab_utils	=	require('sdk/tabs/utils');
var window_util	=	require('sdk/window/utils');
var timer		=	require('timer');
var request		=	require('sdk/request').Request;
var { on, once, off, emit }	=	require('sdk/event/core');

// our own libs
var config		=	require('config').config;
var menu		=	require('menu');
var login		=	require('login').login;
var bookmark	=	require('bookmark').bookmark;

var auth		=	false;
var open_app	=	function()
{
	tabs.open({
		url: data.url('index.html'),
		onReady: function(tab) {
			var worker	=	tab.attach({
				contentScriptFile: data.url('load.js')
			});
			worker.port.emit('do_load', auth);
		}
	});
};

/**
 * Set up a specific menu
 */
var setup_menu	=	function(type)
{
	menu.clear_items();
	switch(type)
	{
	case 'menu':
		// main app menu (usually shown when fully logged in)
		menu.items.tagit_app.activate();
		menu.items.tagit_bookmark.activate();
		menu.items.tagit_logout.activate();
		break;
	default:
	case 'login':
		// login menu, shown when logged out
		menu.items.tagit_login.activate();
		break;
	}
};

on(login, 'success', function(new_auth, key) {
	// successful login, let the app know by setting the auth var
	auth	=	{
		auth: new_auth,
		key: key
	};

	// setup the main app menu
	setup_menu('menu');

	// make it look like app is doing something important (even though we're
	// already all set up at this point)
	menu.btn.image	=	data.url('app/images/site/icons/load_16x16.gif');
	timer.setTimeout(function() {
		menu.btn.image	=	data.url('app/favicon.png');
	}, 1000);
});

/**
 * Main menu handler.
 */
on(menu.btn, 'command', function(e) {
	if(!auth)
	{
		// if we're not logged in, show login dialog no matter what.
		login.show(menu.btn);
	}
	else
	{
		// if we're logged in, the different menu items have different actions
		// attached.
		switch(e.target.id)
		{
		case 'tagit_app':
			open_app();
			break;
		case 'tagit_logout':
			auth	=	null;
			setup_menu('login');
			emit(login, 'logout');
			break;
		case 'tagit_bookmark':
		default:
			bookmark.show(menu.btn);
			break;
		}
	}
});

setup_menu('login');

