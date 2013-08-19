var $E = function(selector, filter){ return ($(filter) || document).getElement(selector); };
var $ES = function(selector, filter){ return ($(filter) || document).getElements(selector); };

var _in_ext		=	true;
var _profile	=	false;
var port		=	new FirefoxAddonPort(addon.port);
var _base_url	=	false;
var modal		=	false;
var barfr		=	{
	barf: function(msg) {
		console.log('barfr: ', msg);
		port.send('error', msg);
	}
};


// ------------------------------------------------------------------------------
// replace a very minimal version of the turtl.js app object for basic syncing
// purposes. no routing, no pages, etc.
// ------------------------------------------------------------------------------
var turtl	=	{
	// holds the user model
	user: null,

	// whether or not to sync data w/ server
	sync: false,
	sync_timer: null,

	// if true, tells the app to mirror data to local storage
	mirror: false,

	main_container_selector: 'body',

	// mock keyboard object
	keyboard: {
		bind: function() {},
		unbind: function() {},
		attach: function() {},
		detach: function() {}
	},

	// -------------------------------------------------------------------------
	// Data section
	// -------------------------------------------------------------------------
	// holds messages for all the user's personas
	messages: null,

	// holds project/note data for the user
	profile: null,
	// -------------------------------------------------------------------------

	init: function(auth)
	{
		turtl.user	=	new User();
		turtl.user.login_from_auth(auth);
		turtl.load_profile();
		var html	=	$(document.body).getParent();
		html.setStyles({
			'overflow': 'visible',
			'overflow-y': 'visible'
		});
	},

	load_profile: function()
	{
		this.api.set_auth(this.user.get_auth());
		this.messages	=	new Messages();
		this.profile	=	new Profile();
		this.profile.initial_load({
			complete: function() {
				turtl.profile.persist();
				turtl.setup_syncing();
				addon.port.emit('profile-load-complete');
				$(document.body).innerHTML	=	'<div id="wrap-modal"><div id="wrap"><div id="main"></div></div></div>';
				new BookmarkController({
					inject: '#main'
				});
			}
		});
	},

	setup_syncing: function()
	{
		// listen for syncing from addon
		if(window.port) window.port.bind('profile-sync', function(sync) {
			if(!sync) return false;
			turtl.profile.process_sync(data_from_addon(sync));
		});
	},

	loading: function(yesno)
	{
	}
};

// ------------------------------------------------------------------------------
// setup event handling for sync script
// ------------------------------------------------------------------------------
window.addEvent('domready', function() {
	addon.port.emit('loaded');
});

addon.port.on('init', function(user_auth, profile_data, base) {
	window._profile			=	profile_data;
	window._base_url		=	base;
	window.__site_url		=	window.__site_url || '';
	window.__api_url		=	window.__api_url || '';
	window.__api_key		=	window.__api_key || '';
	turtl.api				=	new Api(
		__api_url || '',
		__api_key || '',
		function(cb_success, cb_fail) {
			return function(data)
			{
				if(typeof(data) == 'string')
				{
					data	=	JSON.decode(data);
				}
				if(data.__error) cb_fail(data.__error);
				else cb_success(data);
			};
		}
	);

	// make sure inline templates are loaded
	Template.initialize();

	turtl.init(user_auth);
});

