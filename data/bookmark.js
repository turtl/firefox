var $E = function(selector, filter){ return ($(filter) || document).getElement(selector); };
var $ES = function(selector, filter){ return ($(filter) || document).getElements(selector); };

var _in_ext		=	true;
var _profile	=	false;
var port		=	new FirefoxAddonPort(addon.port);
var barfr		=	null;

// ------------------------------------------------------------------------------
// replace a very minimal version of the tagit.js app object for basic syncing
// purposes. no routing, no pages, etc.
// ------------------------------------------------------------------------------
var tagit	=	{
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
		tagit.user	=	new User();
		tagit.user.login_from_auth(auth);
		tagit.load_profile();
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
				tagit.profile.persist();
				tagit.setup_syncing();
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
		tagit.profile.get_sync_time();
		this.sync_timer = new Timer(10000);
		this.sync_timer.end = function()
		{
			tagit.profile.sync();
			this.sync_timer.start();
		}.bind(this);
		this.sync_timer.start();

		// listen for syncing from addon
		if(window.port) window.port.bind('profile-sync', function(sync) {
			if(!sync) return false;
			tagit.profile.process_sync(data_from_addon(sync));
		});
	}
};

// ------------------------------------------------------------------------------
// setup event handling for sync script
// ------------------------------------------------------------------------------
window.addEvent('domready', function() {
	addon.port.emit('loaded');
});

addon.port.on('init', function(user_auth, profile_data) {
	window._profile			=	profile_data;
	window.__site_url		=	window.__site_url || '';
	window.__api_url		=	window.__api_url || '';
	window.__api_key		=	window.__api_key || '';
	tagit.api				=	new Api(
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

	// create the barfr
	barfr	=	new Barfr('barfr', {});

	tagit.init(user_auth);
});

