var $E = function(selector, filter){ return ($(filter) || document).getElement(selector); };
var $ES = function(selector, filter){ return ($(filter) || document).getElements(selector); };

var _in_ext	=	true;
var port	=	new FirefoxAddonPort(addon.port);
var barfr	=	{
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
	sync: true,
	sync_timer: null,

	// if true, tells the app to mirror data to local storage
	mirror: false,

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
	},

	load_profile: function()
	{
		this.api.set_auth(this.user.get_auth());
		this.messages	=	new Messages();
		this.profile	=	new Profile();
		this.profile.initial_load({
			complete: function() {
				turtl.profile.persist({now: true});
				turtl.setup_syncing();
				addon.port.emit('profile-load-complete');
			}
		});
	},

	setup_syncing: function()
	{
		turtl.profile.get_sync_time();

		// set up manual syncing
		if(window.port) window.port.bind('do-sync', function() {
			turtl.profile.sync();
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

addon.port.on('init', function(user_auth) {
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

	turtl.init(user_auth);
});

addon.port.on('start', function() {
	turtl.sync	=	true;
});

addon.port.on('stop', function() {
	turtl.sync	=	false;
});

