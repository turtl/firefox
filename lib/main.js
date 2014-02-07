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
	var background		=	require('background');
	var app_menu		=	require('menu');
	var rsa				=	require('rsa');
	var user			=	require('user');
	var about			=	require('about').about;
	var xhr_wrapper		=	require('xhr_wrapper');
	var bookmark		=	require('bookmark');
	var poller			=	require('poller');
	var personas		=	require('personas');
	var messages		=	require('messages');
	var invites			=	require('invites');
	var debug			=	require('debug');
	var start			=	require('start');

	var enabled			=	true;

	// -------------------------------------------------------------------------
	// main functions
	// -------------------------------------------------------------------------
	var base_url		=	function(url) { return url.replace(/(^[a-z]+:\/\/[^\/]+).*?$/, '$1') + '/'; };
	var app_base_url	=	base_url(data.url(''));

	/**
	 * Opens the turtl app tab (assuming it's not already open) and tracks/loads
	 * it.
	 * TODO: move to library
	 */
	var open_app	=	function(options)
	{
		options || (options = {});

		// if we already have an app tab open, activate it and return
		var tabs	=	windows.activeWindow.tabs;
		var app_tab	=	false;
		for(var i = 0; i < tabs.length; i++)
		{
			var tab	=	tabs[i];
			if(tab.url.match(app_base_url))
			{
				app_tab	=	tab;
				break;
			}
		}

		if(app_tab)
		{
			app_tab.activate();
			return true;
		}

		// don't load app unless logged in
		if(!data_handler.get('auth', false)) return false;

		var tab_ready	=	function(tab)
		{
			// attach a script which sets/inits specific variables within the
			// app itself. this is mainly to let the app know it's being loaded
			// by an extension.
			var worker	=	tab.attach({
				contentScriptFile: data.url('app_load.js')
			});

			// if tab reloads, reset app
			tab.on('ready', function(tab) {
				//pinned	=	tab.isPinned;
				worker.destroy();
				if(tab.url.match(app_base_url))
				{
					tab.close();
					open_app();
				}
			});

			// we may need to open the personas interface via the app. it's more
			// consistent to do it via the background panel than in-app
			worker.port.on('personas-add-open', function() {
				personas.open({add: true, force: true});
			});

			worker.port.on('msglol', function(msg) { 
				console.log('object: ', msg);
			});

			// load that shit, and pass in our auth object.
			worker.port.emit('do_load', data_handler.get('auth'), data_handler.get('profile'), data.url('app'), config);

			// give the app tab access to XHR
			// ...NOOOOOT!!!!
			//xhr_wrapper.wrap(worker.port);

			// give the tab direct access to the message passer
			tab.port	=	worker.port;
		};

		// open a new tab to the app
		tabs.open({
			// points to our generated index.html, which loads everything
			url: data.url('index.html'),
			//isPinned: !!pinned,
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

		var tablist		=	tab_util.getTabs();
		for(var i = 0, n = tablist.length; i < n; i++)
		{
			var tab			=	tablist[i];
			var taburl		=	tab_util.getURI(tab);
			var tab_base	=	base_url(taburl);
			// if we find an open turtl tab, close it
			if(tab_base == app_base_url)
			{
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
				btn.setAttribute('disabled', true);
			});
		}
		else
		{
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/images/favicon.png'));
				btn.setAttribute('disabled', false);
			});
		}
	};

	/**
	 * Given a set of user information, mark the addon as "logged in" and perform
	 * any needed tasks for when this happens.
	 */
	var do_login	=	function(user_id, user_auth, user_key, options)
	{
		options || (options = {});

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
			attach: function() { return menu.btn() },
			onLoadComplete: function() {
				loading(false);
				setup_menu('menu');

				if(options.join)
				{
					// we got a rookie, open the "add persona" dialog
					personas.open({
						force: true,
						add: true,
						join: true
					});

					// when the personas window is closed, we're done. show the
					// invites or "welcome! click da button msg"
					on(background.port, 'close', function show_joined() {
						off(background.port, 'close', show_joined);
						if(invites.have_pending())
						{
							// we have pending invites. scrap the stupid welcome
							// message and show the invites dialog
							invites.open(menu.btn());
						}
						else
						{
							// no invites, show "WELCOME" message
							//start.open_joined(menu.btn());
						}
						open_app()
					});
				}
				else if(invites.have_pending())
				{
					// if we have pending invites, open the invites dialog so they can start
					// accepting/denying them
					invites.open(menu.btn());
				}
			}
		});

		// initialize our post-login libs
		messages.init(data_handler, background);
		bookmark.init(background);
		personas.init(background, rsa);
		if(config.debug) debug.init(background);

		// listen for invite removals and send them over to the invite lib
		background.panel_port().on('invite-remove', function(invite_id) {
			invites.remove(invite_id);
		});

		// wire up some menu stuff (mainly, invites counter)
		on(invites.port, 'num-invites', function(num) {
			menu.port.emit('num-invites', num);
			invites.notify();
		});
		on(messages.port, 'num-messages', function(num) {
			menu.port.emit('num-messages', num);
			invites.notify();
		});
	};

	/**
	 * Removes all auth info and does any post-logout cleanup.
	 */
	var do_logout	=	function()
	{
		data_handler.unset('auth');
		personas.destroy();
		bookmark.destroy();
		messages.destroy();
		background.destroy();
		setup_menu('login');
	};

	// -------------------------------------------------------------------------
	// main event handlers
	// -------------------------------------------------------------------------
	// setup an actions for successful login/signup
	on(user.port, 'login-success', do_login);
	on(user.port, 'join-success', function() {
		// add a fourth 'optons' param w/ join:true
		var args	=	Array.prototype.slice.call(arguments, 0);
		args.push({join: true});
		do_login.apply(this, args);
	});

	// -------------------------------------------------------------------------
	// menu section
	// -------------------------------------------------------------------------
	// holds the app button/menu
	var menu		=	false;

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
				menu.open();
			});
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/images/favicon.png'));
				btn.setAttribute('tooltiptext', 'Turtl menu');
			});
			menu.set_dispatch(function(url) {
				menu.close();
				switch(url)
				{
				case 'app':
					open_app();
					break;
				case 'bookmark':
					bookmark.open();
					break;
				case 'personas':
					personas.open();
					break;
				case 'personas-join':
					personas.open({
						force: true,
						add: true,
						join: true
					});
					break;
				case 'invites':
					invites.open();
					break;
				case 'logout':
					do_logout();
					break;
				}
			});
			break;
		case 'login':
		default:
			// login menu, shown when logged out
			menu.on_click(function() {
				user.open(menu.btn());
			});
			menu.button().buttons(function(btn) {
				btn.setAttribute('image', data.url('app/images/favicon.gray.png'));
				btn.setAttribute('tooltiptext', 'Login/Join');
			});
			break;
		}
	};

	// -------------------------------------------------------------------------
	// init section
	// -------------------------------------------------------------------------
	var reason	=	require('sdk/self').loadReason;

	console.log('VERSION: ', config.version);
	exports.main	=	function(options, callbacks)
	{
		// "enable" the app so anything that polls knows it's ok to do so
		enabled		=	true;
		var reason	=	options.loadReason;

		// init the main button/menu
		var is_install	=	(['upgrade', 'downgrade', 'enable', 'install'].indexOf(reason) > -1);
		menu	=	app_menu.Menu(rsa, {
			id: 'turtl_button',
			label: 'Turtl',
			image: data.url('app/images/favicon.png'),
			tooltiptext: '',
			menu: false,
			is_install: is_install
		});
		windows.on('open', function(window) {
			setup_menu();
		});

		// initialize user panel
		user.init();

		// start invite system. looks for invite URLs in open tabs (and creates
		// a page mod to find invites as well) and tracks them
		invites.init(data_handler, background, personas, messages);

		// make sure no turtl tabs are open unless logged in
		poller.add_poller(monitor_app_tabs);

		// init/start the poller
		poller.set_enable_cb(function() { return enabled; });
		poller.poll(500);

		// set up the main menu options. use a timer here to fix some stupid
		// reace condition
		timer.setTimeout( setup_menu, 0 );

		// if this is an install, show the FIRST TIME USER??!?!?! CLIIIIICK HERE! msg
		if(reason == 'install')
		{
			start.open(menu.btn());
		}

		//TODO: removeme!
		timer.setTimeout( function() {
			/*
			do_login(
				'51dcae66735ca406dc000004',
				'pzErMDZ72Imcuf5BwspEXo93VmNbD8kAHvJMz+aXFq7x+Rv1OGj9ADIxydqpvGS80MKaBsBwXyQP1ti5n2G2/xDRuZ/c0PPzyu5F/AznnsA=:i62696666346332383139383732343962',
				'tvlrsWpXFODbjBCzL050GMVP7rfSRsXC/e6cN+bUuqw='
			);
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
		user.destroy();
		about.destroy();
		menu.destroy();
		data_handler.destroy();

		if(['upgrade', 'downgrade', 'disable', 'uninstall'].indexOf(reason) > -1)
		{
			//menu.uninstall();
		}
		// "disable" the app. any pollers will stfu
		enabled	=	false;
	};
})();
