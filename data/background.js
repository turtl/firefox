window.firefox				=	true;
window._in_ext				=	true;
window._in_background		=	true;
window._enable_api_tracker	=	false;
var port		=	new FirefoxAddonPort(addon.port);
var _base_url	=	false;

// ------------------------------------------------------------------------------
// setup event handling for sync script
// ------------------------------------------------------------------------------
addon.port.on('init', function(auth, base) {
	// overwrite some css that makes sense in a tab but not in a panel
	var html	=	$(document.body).getParent();
	html.setStyles({
		'overflow': 'visible',
		'overflow-y': 'visible'
	});

	_base_url	=	base;

	// enable sync
	turtl.do_sync			=	true;
	turtl.do_remote_sync	=	true;

	// login. this will also load all profile data and start syncing
	turtl.user.login_from_auth(auth);
});

addon.port.on('start', function() {
	turtl.do_sync	=	true;
});

addon.port.on('stop', function() {
	turtl.do_sync	=	false;
});

addon.port.on('set-config', function(config) {
	window.__api_url		=	config.api_url;
	window.config.version	=	config.version;
	if(window.turtl && turtl.api)
	{
		turtl.api.api_url	=	window.__api_url;
	}
	window._debug_mode	=	config.debug;
});
port.send('pre-load');

