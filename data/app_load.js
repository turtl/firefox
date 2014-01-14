if(unsafeWindow.turtl)
{
	self.port.on('do_load', function(auth, profile_data, base, config) {
		unsafeWindow._in_ext				=	true;
		unsafeWindow._auth					=	auth;
		unsafeWindow._base_url				=	base;
		unsafeWindow._profile				=	profile_data;
		unsafeWindow.__api_url				=	config.api_url;

		// disable sync because we'll be syncing via the local db
		unsafeWindow.turtl.do_sync			=	false;
		unsafeWindow.turtl.do_remote_sync	=	false;
		if(unsafeWindow.turtl.api)
		{
			unsafeWindow.turtl.api.api_url	=	unsafeWindow.__api_url;
		}
	});

	// create a port/event adaptor (Firefox-specific) for the app
	unsafeWindow.port	=	new unsafeWindow.FirefoxAddonPort(self.port);
}
