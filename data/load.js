if(unsafeWindow.turtl)
{
	self.port.on('do_load', function(auth, profile_data, base) {
		unsafeWindow._in_ext	=	true;
		unsafeWindow._auth		=	auth;
		unsafeWindow._base_url	=	base;
		unsafeWindow._profile	=	profile_data;

		// disable sync because we'll be sending in updates via the data_handler
		unsafeWindow.turtl.sync	=	false;
	});

	// create a port/event adaptor (Firefox-specific) for the app
	unsafeWindow.port	=	new unsafeWindow.FirefoxAddonPort(self.port);
}
