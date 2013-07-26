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
var join		=	require('join').join;
var about		=	require('about').about;
var bookmark	=	require('bookmark').bookmark;

var auth		=	false;
var app_tab		=	false;

var open_app	=	function()
{
	if(app_tab)
	{
		app_tab.activate();
		return true;
	}

	tabs.open({
		url: data.url('index.html'),
		onReady: function(tab) {
			app_tab		=	tab;
			tab.on('close', function() {
				app_tab	=	false;
			});
			var worker	=	tab.attach({
				contentScriptFile: data.url('load.js')
			});
			worker.port.emit('do_load', auth);
			worker.port.on('xhr', function(args) {
				var id		=	args.id;
				var method	=	args.method;
				var url		=	config.api_site + args.url;
				var options	=	{
					url: url,
					headers: args.headers,
					content: args.data,
					onComplete: function(result) {
						worker.port.emit('xhr-response', id, {
							status: result.status,
							text: result.text,
							statusText: result.statusText,
							headers: result.headers
						});
					}
				};
				var req	=	request(options);
				if(method.toLowerCase() == 'get')
				{
					req.get();
				}
				else
				{
					req.post();
				}
			});
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
		menu.btn.setAttribute('image', data.url('app/favicon.png'));
		menu.items.tagit_app.activate();
		menu.items.tagit_bookmark.activate();
		menu.items.tagit_logout.activate();
		break;
	default:
	case 'login':
		// login menu, shown when logged out
		menu.btn.setAttribute('image', data.url('app/favicon_gray.png'));
		menu.items.tagit_login.activate();
		menu.items.tagit_join.activate();
		break;
	}
	menu.items.tagit_about.activate();
};

// setup an action for successful login
on(login, 'success', function(user_id, new_auth, key) {
	// successful login, let the app know by setting the auth var
	auth	=	{
		uid: user_id,
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

// setup an action for successful signup
on(join, 'success', function(user_id, new_auth, key) {
	// successful login, let the app know by setting the auth var
	auth	=	{
		uid: user_id,
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
		switch(e.target.id)
		{
		case 'tagit_about':
			tabs.open({ url: config.site_url + '/about', });
			break;
		case 'tagit_join':
			join.show(menu.btn);
			break;
		case 'tagit_login':
		default:
			login.show(menu.btn);
			break;
		}
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
			if(app_tab) app_tab.close();
			setup_menu('login');
			emit(login, 'logout');
			break;
		case 'tagit_about':
			tabs.open({ url: config.site_url + '/about', });
			break;
		case 'tagit_bookmark':
		default:
			bookmark.show(menu.btn);
			break;
		}
	}
});

setup_menu('login');

