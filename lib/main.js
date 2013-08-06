(function() {
	var data		=	require('sdk/self').data;
	var tabs		=	require('sdk/tabs');
	var timer		=	require('timer');
	var { on, once, off, emit }	=	require('sdk/event/core');

	// our own libs
	var config			=	require('config').config;
	var data_handler	=	require('data_handler');
	var sync			=	require('sync');
	var menu			=	require('menu');
	var login			=	require('login').login;
	var join			=	require('join').join;
	var about			=	require('about').about;
	var xhr_wrapper		=	require('xhr_wrapper');
	var bookmark		=	require('bookmark');

	var app_tab			=	false;
	var pinned			=	false;

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
		if(!data_handler.get('auth', false)) return false;

		var tab_ready	=	function(tab)
		{
			// save the tab for later referencing
			app_tab		=	tab;
			console.log('tab: ready main');

			// attach a script which sets/inits specific variables within the
			// app itself. this is mainly to let the app know it's being loaded
			// by an addon, AND to give the app a means to make XHR requests by
			// sending events through self.port in the content script (see
			// api.js, specifically ApiTracker for more info).
			var worker	=	tab.attach({
				contentScriptFile: data.url('load.js')
			});

			// if tab reloads, reset app
			tab.on('ready', function(tab) {
				if(tab.isPinned) pinned = true;
				worker.destroy();
				tab.close();
				open_app();
			});

			// sync to app
			var sync_to_app	=	function(data) { worker.port.emit('profile-sync', data); };
			on(sync.port, 'profile-sync', sync_to_app);

			// when the tab closes, erase the reference var (and cleanup listeners)
			tab.on('close', function() {
				app_tab = false;
				off(sync.port, 'profile-sync', sync_to_app);
			});

			// load that shit, and pass in our auth object.
			worker.port.emit('do_load', data_handler.get('auth'), data.url('app'), data_handler.get('profile'));

			// give the app tab access to XHR
			xhr_wrapper.wrap(worker.port);

			// give the app_tab direct access to the message passer
			app_tab.port	=	worker.port;
		};

		// open a new tab to the app
		tabs.open({
			// points to our generated index.html, which loads everything
			url: data.url('index.html'),
			isPinned: pinned,
			onReady: tab_ready
		});
	};

	var loading	=	function(yesno)
	{
		yesno || (yesno = false);
		if(yesno)
		{
			menu.btn().image	=	data.url('app/images/site/icons/load_16x16.gif');
		}
		else
		{
			menu.btn().image	=	data.url('app/favicon.png');
		}
	};

	/**
	 * Set up a specific menu
	 */
	var setup_menu	=	function(type)
	{
		menu.clear_items();
		if(!type && data_handler.get('auth', false)) type = 'menu';
		switch(type)
		{
		case 'menu':
			// main app menu (usually shown when fully logged in)
			menu.btn().setAttribute('image', data.url('app/favicon.png'));
			menu.btn().setAttribute('tooltiptext', 'Bookmark this site (or add a new note)');
			menu.items().tagit_bookmark.activate();
			menu.items().tagit_app.activate();
			menu.items().tagit_logout.activate();
			break;
		case 'login':
		default:
			// login menu, shown when logged out
			menu.btn().setAttribute('image', data.url('app/favicon_gray.png'));
			menu.btn().setAttribute('tooltiptext', 'Log in to Tagit');
			menu.items().tagit_login.activate();
			menu.items().tagit_join.activate();
			break;
		}
		// always show "about"
		menu.items().tagit_about.activate();
	};

	/**
	 * Given a set of user information, mark the addon as "logged in" and perform
	 * any needed tasks for when this happens.
	 */
	var do_login	=	function(user_id, user_auth, user_key)
	{
		// set up our auth object (this marks the addon as "logged in")
		data_handler.set({
			auth: {
				uid: user_id,
				auth: user_auth,
				key: user_key
			}
		});

		// setup profile syncing, and continue addon load when profile data has
		// loaded successfully
		loading(true);
		sync.init(data_handler, {
			onLoadComplete: function() {
				loading(false);
				setup_menu('menu');
				bookmark.init(data_handler, sync, {
					onLoadComplete: function() {
					}
				});
			}
		});
	};

	/**
	 * Removes all auth info and does any post-logout cleanup.
	 */
	var do_logout	=	function()
	{
		data_handler.unset('auth');
		bookmark.destroy();
		sync.destroy();
		if(app_tab) app_tab.close();
		setup_menu('login');
		emit(login, 'logout');
	};

	// -----------------------------------------------------------------------------
	// main event handlers
	// -----------------------------------------------------------------------------
	// setup an actions for successful login/signup
	on(login, 'success', do_login);
	on(join, 'success', do_login);

	var menu_event_handler	=	function()
	{
		/**
		 * menu handler.
		 */
		on(menu.btn(), 'command', function(e) {
			if(!data_handler.get('auth'))
			{
				// handler for logged out menu
				switch(e.target.id)
				{
				case 'tagit_about':
					about.show(menu.btn());
					break;
				case 'tagit_join':
					join.show(menu.btn());
					break;
				case 'tagit_login':
				default:
					login.show(menu.btn());
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
					do_logout();
					break;
				case 'tagit_about':
					about.show(menu.btn());
					break;
				case 'tagit_bookmark':
				default:
					bookmark.open(menu.btn());
					break;
				}
			}
		});
	};

	// -----------------------------------------------------------------------------
	// init section
	// -----------------------------------------------------------------------------
	var reason	=	require('sdk/self').loadReason;

	exports.main	=	function(options, callbacks)
	{
		var reason	=	options.loadReason;
		console.log('load: reason: ', reason);

		var is_install	=	(['upgrade', 'downgrade', 'enable', 'install'].indexOf(reason) > -1);
		menu.init();
		menu.install(is_install);

		menu_event_handler();
		timer.setTimeout( setup_menu, 0 );	// fix some annoying race condition

		//TODO: removeme!
		/*
		do_login(
			'51dcae66735ca406dc000004',
			'pzErMDZ72Imcuf5BwspEXo93VmNbD8kAHvJMz+aXFq7x+Rv1OGj9ADIxydqpvGS80MKaBsBwXyQP1ti5n2G2/xDRuZ/c0PPzyu5F/AznnsA=:i62696666346332383139383732343962',
			'tvlrsWpXFODbjBCzL050GMVP7rfSRsXC/e6cN+bUuqw='
		);
		*/
		/*
		do_login(
			'51e0063c3dc42c0db8000007',
			'3O/PGOPe5e1f6HfZ1jHS3G6eviKRlO7kSQJ1uBi7V4BgBTfJ1x5u1CyN30Lg1QMZDhigyF+aiTxK1E79OcycDtU1hemfIXq4gwrUqouUMjU=:i616e6472657734633238313938373234',
			'E4sN1Q+MjaIuyx7UUMEnOdjeU3f8BJSG0ydXiqoJ+vA='
		);
		*/
	};

	exports.onUnload	=	function(reason)
	{
		console.log('unload: reason: ', reason);
		do_logout();
		if(['upgrade', 'downgrade', 'disable', 'uninstall'].indexOf(reason) > -1)
		{
			menu.uninstall();
		}
	};
})();
