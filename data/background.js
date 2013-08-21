var _in_ext		=	true;
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

	// replace the barfr object. doesnt do us much good inside a panel
	barfr	=	{
		barf: function(msg) {
			console.log('barfr: ', msg);
			port.send('error', msg);
		}
	};

	_base_url	=	base;

	// enable sync
	turtl.sync	=	true;

	// login. this will also load all profile data and start syncing
	turtl.user.login_from_auth(auth);
});

addon.port.on('start', function() {
	turtl.sync	=	true;
});

addon.port.on('stop', function() {
	turtl.sync	=	false;
});

