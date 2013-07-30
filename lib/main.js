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

//TODO: removeme!
auth={
	uid: '51dcae66735ca406dc000004',
	auth: 'pzErMDZ72Imcuf5BwspEXo93VmNbD8kAHvJMz+aXFq7x+Rv1OGj9ADIxydqpvGS80MKaBsBwXyQP1ti5n2G2/xDRuZ/c0PPzyu5F/AznnsA=:i62696666346332383139383732343962',
	key: 'tvlrsWpXFODbjBCzL050GMVP7rfSRsXC/e6cN+bUuqw='
};

// -----------------------------------------------------------------------------
// main functions
// -----------------------------------------------------------------------------
var open_app	=	function()
{
	// if we already have an app tab open, activate it and return
	if(app_tab)
	{
		app_tab.activate();
		return true;
	}

	// don't load app unless logged in
	if(!auth) return false;

	// open a new tab to the app
	tabs.open({
		// points to our generated index.html, which loads everything
		url: data.url('index.html'),
		onOpen: function(tab) {
			//tab.pin();
		},
		onClose: function(tab) {
		},
		onReady: function(tab) {
			// save the tab for later referencing
			app_tab		=	tab;

			// when the tabl closes, erase the reference var
			tab.on('close', function() { app_tab = false; });

			// attach a script which sets/inits specific variables within the
			// app itself. this is mainly to let the app know it's being loaded
			// by an addon, AND to give the app a means to make XHR requests by
			// sending events through self.port in the content script (see
			// api.js, specifically ApiTracker for more info).
			var worker	=	tab.attach({
				contentScriptFile: data.url('load.js')
			});
			// load that shit, and pass in our auth object.
			worker.port.emit('do_load', auth, data.url('app'));

			// monitor the worker for XHR requests from the app. we take any
			// applicable data, do our own request here, then send back any
			// response data via an event the app listens for.
			//
			// this allows the app to make XHR requests as if it's talking to a
			// local server even when it would otherwise be impossible (due to
			// XSS limitations of loading the app in a tab).
			worker.port.on('xhr', function(args) {
				var id		=	args.id;
				var method	=	args.method;
				var url		=	config.api_url + args.url;
				//console.log('req('+id+'): ', method, args.url);
				var options	=	{
					url: url,
					headers: args.headers,
					content: args.data,
					onComplete: function(result) {
						// got response, send it back into the app
						//console.log('res('+id+'): ', result.status);
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
	if(!type && auth) type = 'menu';
	switch(type)
	{
	case 'menu':
		// main app menu (usually shown when fully logged in)
		menu.btn.setAttribute('image', data.url('app/favicon.png'));
		menu.items.tagit_bookmark.activate();
		menu.items.tagit_app.activate();
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
	// always show "about"
	menu.items.tagit_about.activate();
};

/**
 * Given a set of user information, mark the addon as "logged in" and perform
 * any needed tasks for when this happens.
 */
var do_login	=	function(user_id, user_auth, user_key)
{
	// set up our auth object (this marks the addon as "logged in")
	auth	=	{
		uid: user_id,
		auth: user_auth,
		key: user_key
	};

	console.log('auth: uid: ', auth.uid);
	console.log('auth: auth: ', auth.auth);
	console.log('auth: key: ', auth.key);

	// setup the main app menu (as opposed to logged-out menu)
	setup_menu('menu');

	// make it look like app is doing something important (even though we're
	// already all set up at this point LOLOL)
	menu.btn.image	=	data.url('app/images/site/icons/load_16x16.gif');
	timer.setTimeout(function() {
		menu.btn.image	=	data.url('app/favicon.png');
	}, 750);
};

// -----------------------------------------------------------------------------
// main event handlers
// -----------------------------------------------------------------------------
// setup an actions for successful login/signup
on(login, 'success', do_login);
on(join, 'success', do_login);

/**
 * menu handler.
 */
on(menu.btn, 'command', function(e) {
	if(!auth)
	{
		// handler for logged out menu
		switch(e.target.id)
		{
		case 'tagit_about':
			about.show(menu.btn);
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
		// handler for logged-in menu
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
			about.show(menu.btn);
			break;
		case 'tagit_bookmark':
		default:
			bookmark.show(menu.btn);
			break;
		}
	}
});

// -----------------------------------------------------------------------------
// init section
// -----------------------------------------------------------------------------
setup_menu();

