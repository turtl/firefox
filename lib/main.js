(function() {
	var data		=	require('sdk/self').data;
	var tabs		=	require('sdk/tabs');
	var tab_util	=	require('sdk/tabs/utils');
	var timer		=	require('timer');
	var windows		=	require('sdk/windows').browserWindows;
	var private_br	=	require('sdk/private-browsing');
	var { on, once, off, emit }	=	require('sdk/event/core');

	// our own libs
	var config			=	require('config').config;
	var data_handler	=	require('data_handler');
	var background			=	require('background');
	var app_menu		=	require('menu');
	var login			=	require('login').login;
	var join			=	require('join').join;
	var about			=	require('about').about;
	var xhr_wrapper		=	require('xhr_wrapper');
	var bookmark		=	require('bookmark');
	var poller			=	require('poller');
	var app_tabs		=	require('tab_tracker');
	var personas		=	require('personas');
	var invites			=	require('invites');

	var enabled			=	true;
	var pinned			=	false;

	// -------------------------------------------------------------------------
	// main functions
	// -------------------------------------------------------------------------
	/**
	 * Opens the turtl app tab (assuming it's not already open) and tracks/loads
	 * it.
	 * TODO: move to library
	 */
	var open_app	=	function(options)
	{
		options || (options = {});

		// if we already have an app tab open, activate it and return
		var app_tab	=	app_tabs.exists();
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
			app_tabs.track(tab);

			// attach a script which sets/inits specific variables within the
			// app itself. this is mainly to let the app know it's being loaded
			// by an addon, AND to give the app a means to make XHR requests by
			// sending events through self.port in the content script (see
			// api.js, specifically ApiTracker for more info).
			var worker	=	tab.attach({
				contentScriptFile: data.url('load.js')
			});

			// keep the tab's pinned state monitored
			var monitor_pinned	=	function() {
				if(typeof(tab.isPinned) == 'undefined') return;
				pinned	=	tab.isPinned;
			};
			poller.add_poller(monitor_pinned);

			// if tab reloads, reset app
			tab.on('ready', function(tab) {
				poller.remove_poller(monitor_pinned);
				pinned	=	tab.isPinned;
				worker.destroy();
				tab.close();
				open_app();
			});

			// sync to app
			var sync_to_app	=	function(data, forced) { worker.port.emit('profile-sync', data, forced); };
			on(background.port, 'profile-sync', sync_to_app);
			worker.port.on('profile-mod', function() {
				// manually run a sync
				emit(background.port, 'do-sync');
			});

			// when the tab closes, erase the reference var (and cleanup listeners)
			tab.on('close', function() {
				poller.remove_poller(monitor_pinned);
				app_tabs.untrack(tab);
				off(background.port, 'profile-sync', sync_to_app);
			});

			// load that shit, and pass in our auth object.
			worker.port.emit('do_load', data_handler.get('auth'), data_handler.get('profile'), data.url('app'));

			// give the app tab access to XHR
			xhr_wrapper.wrap(worker.port);

			// give the tab direct access to the message passer
			tab.port	=	worker.port;
		};

		// open a new tab to the app
		tabs.open({
			// points to our generated index.html, which loads everything
			url: data.url('index.html'),
			isPinned: !!pinned,
			onReady: tab_ready,
			isPrivate: private_br.isPrivate(windows.activeWindow)
		});
	};

	/**
	 * Make sure that there are no open turtl tabs. This essential, because an
	 * open turtl tab (when logged out) will really screw many things up for the
	 * user.
	 *
	 * Note that this can happen either via tab pinning or a user restoring
	 * their tab history (possibly other situations) and as such, can't just be
	 * checked on startup, but must be continually monitored.
	 */
	var monitor_app_tabs	=	function()
	{
		// if we're logged in, no need to close any tabs
		if(data_handler.get('auth')) return false;

		var base_url	=	function(url)
		{
			return url.replace(/(^[a-z]+:\/\/[^\/]+).*?$/, '$1') + '/';
		};
		var app_base	=	base_url(data.url('index.html'));
		var tablist		=	tab_util.getTabs();
		for(var i = 0, n = tablist.length; i < n; i++)
		{
			var tab			=	tablist[i];
			var taburl		=	tab_util.getURI(tab);
			var tab_base	=	base_url(taburl);
			// if we find an open turtl tab, close it
			if(tab_base == app_base)
			{
				pinned	=	tab.getAttribute('pinned');
				tab_util.closeTab(tab);
			}
		}
	};

	/**
	 * Shows (or hides) a loading indicator in the turtl button logo.
	 */
	var loading	=	function(yesno)
	{
		yesno || (yesno = false);
		if(yesno)
		{
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/images/site/icons/load_16x16.gif'));
			});
		}
		else
		{
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/favicon.png'));
			});
		}
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
		background.init(data_handler, poller, {
			onLoadComplete: function() {
				loading(false);
				setup_menu('menu');
				bookmark.init(background);
				personas.init(background);
			}
		});

		// if we have pending invites, open the invites dialog so they can start
		// accepting/denying them
		if(invites.have_pending())
		{
			invites.open(menu.btn());
		}
	};

	/**
	 * Removes all auth info and does any post-logout cleanup.
	 */
	var do_logout	=	function()
	{
		data_handler.unset('auth');
		bookmark.destroy();
		background.destroy();
		app_tabs.destroy();
		setup_menu('login');
		emit(login, 'logout');
	};

	// -------------------------------------------------------------------------
	// main event handlers
	// -------------------------------------------------------------------------
	// setup an actions for successful login/signup
	on(login, 'success', do_login);
	on(join, 'success', do_login);

	// -------------------------------------------------------------------------
	// menu section
	// -------------------------------------------------------------------------
	// holds the app button/menu
	var menu		=	false;
	var menu_items	=	{
		bookmark: {
			id: 'turtl_bookmark',
			label: 'Bookmark this page',
			bold: true,
			image: data.url('app/images/site/icons/bookmark_16x16.png'),
			onCommand: function() {
				bookmark.open(menu.btn());
			}
		},
		app: {
			id: 'turtl_app',
			label: 'Open Turtl',
			image: data.url('app/favicon.png'),
			onCommand: function() {
				open_app();
			}
		},
		personas: {
			id: 'turtl_personas',
			label: 'Personas',
			onCommand: function() {
				personas.open(menu.btn());
			}
		},
		invites: {
			id: 'turtl_invites',
			label: 'Invites',
			onCommand: function() {
				invites.open(menu.btn());
			}
		},
		login: {
			id: 'turtl_login',
			label: 'Login',
			bold: true,
			onCommand: function() {
				login.show(menu.btn());
			}
		},
		join: {
			id: 'turtl_join',
			label: 'Create account',
			image: data.url('app/images/site/icons/join_16x16_black.png'),
			onCommand: function() {
				join.show(menu.btn());
			}
		},
		logout: {
			id: 'turtl_logout',
			label: 'Logout',
			onCommand: function() {
				do_logout();
			}
		},
		help: {
			id: 'turtl_help',
			label: 'Help',
			image: data.url('app/images/site/icons/help_16x16_black.png')
		},
		about: {
			id: 'turtl_about',
			label: 'About',
			onCommand: function() {
				about.show(menu.btn());
			}
		}
	};

	/**
	 * Set up a specific menu
	 */
	var setup_menu	=	function(type)
	{
		if(!menu.btn()) return false;

		if(!type && data_handler.get('auth', false)) type = 'menu';

		switch(type)
		{
		case 'menu':
			// main app menu (usually shown when fully logged in)
			menu.on_click(function() {
				menu_items.bookmark.onCommand();
			});
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/favicon.png'));
				btn.setAttribute('tooltiptext', 'Bookmark this site (or add a new note)');
			});
			menu.button().updateMenus([
				menu_items.bookmark,
				menu_items.app,
				menu_items.personas,
				menu_items.invites,
				menu_items.logout,
				menu_items.about
			]);
			break;
		case 'login':
		default:
			// login menu, shown when logged out
			menu.on_click(function() {
				menu_items.login.onCommand();
			});
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/favicon_gray.png'));
				btn.setAttribute('tooltiptext', 'Log in to Turtl');
			});
			menu.button().updateMenus([
				menu_items.login,
				menu_items.join,
				menu_items.about
			]);
			break;
		}
	};

	// -------------------------------------------------------------------------
	// init section
	// -------------------------------------------------------------------------
	var reason	=	require('sdk/self').loadReason;

	exports.main	=	function(options, callbacks)
	{
		// "enable" the app so anything that polls knows it's ok to do so
		enabled		=	true;
		var reason	=	options.loadReason;

		// init the main button/menu
		var is_install	=	(['upgrade', 'downgrade', 'enable', 'install'].indexOf(reason) > -1);
		menu	=	app_menu.Menu({
			id: 'turtl_button',
			label: 'Turtl',
			image: data.url('app/favicon.png'),
			tooltiptext: '',
			menu_items: [],
			is_install: is_install
		});
		windows.on('open', function(window) {
			setup_menu();
		});

		// look for invites on main site
		invites.init(data_handler, menu);
		on(invites.port, 'invite_open', function() {
			invites.open(menu.btn());
		});

		// make sure no turtl tabs are open unless logged in
		poller.add_poller(monitor_app_tabs);

		// init/start the poller
		poller.set_enable_cb(function() { return enabled; });
		poller.poll(500);

		// set up the main menu options. use a timer here to fix some stupid
		// reace condition
		timer.setTimeout( setup_menu, 0 );

		//TODO: removeme!
		timer.setTimeout( function() {
			do_login(
				'51dcae66735ca406dc000004',
				'pzErMDZ72Imcuf5BwspEXo93VmNbD8kAHvJMz+aXFq7x+Rv1OGj9ADIxydqpvGS80MKaBsBwXyQP1ti5n2G2/xDRuZ/c0PPzyu5F/AznnsA=:i62696666346332383139383732343962',
				'tvlrsWpXFODbjBCzL050GMVP7rfSRsXC/e6cN+bUuqw='
			);
			/*
			do_login(
				'51e0063c3dc42c0db8000007',
				'3O/PGOPe5e1f6HfZ1jHS3G6eviKRlO7kSQJ1uBi7V4BgBTfJ1x5u1CyN30Lg1QMZDhigyF+aiTxK1E79OcycDtU1hemfIXq4gwrUqouUMjU=:i616e6472657734633238313938373234',
				'E4sN1Q+MjaIuyx7UUMEnOdjeU3f8BJSG0ydXiqoJ+vA='
			);
			*/
		}, 1000);
	};

	exports.onUnload	=	function(reason)
	{
		// always logout on unload
		do_logout();
		invites.destroy();
		if(['upgrade', 'downgrade', 'disable', 'uninstall'].indexOf(reason) > -1)
		{
			//menu.uninstall();
		}
		// "disable" the app. any pollers will stfu
		enabled	=	false;
	};
})();
