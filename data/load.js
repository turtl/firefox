self.port.on('do_load', function(auth) {
	unsafeWindow._in_ext	=	true;
	unsafeWindow._auth		=	auth;
});
