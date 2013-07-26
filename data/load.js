self.port.on('do_load', function(auth, base) {
	unsafeWindow._in_ext	=	true;
	unsafeWindow._auth		=	auth;
	unsafeWindow._base_url	=	base;
	unsafeWindow.addon		=	self;
});

