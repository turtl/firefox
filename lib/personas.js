var data		=	require('sdk/self').data;
var { on, once, off, emit }	=	require('sdk/event/core');

var background	=	false;
var rsa			=	false;

var init	=	function(_background, _rsa)
{
	background	=	_background;
	rsa			=	_rsa;

	background.panel_port().on('personas-add-open', function() {
		exports.open({add: true, force: true});
	});

	background.panel_port().on('persona-created', function(persona_data) {
		var do_add_key	=	function(key)
		{
			// TODO: build!!
		};

		// get a key from the RSA lib. if one isn't available, wait until one is
		// and then stop listening and call do_add_key
		var key	=	rsa.pop_key();
		if(key)
		{
			// yess!! first try!
			do_add_key(key);
		}
		else
		{
			on(rsa.port, 'new-key', function persona_key_wait() {
				// try to grab a new key
				var key	=	rsa.pop_key();

				// nope, didn't get a key this time (someone might have been
				// ahead of us in line)
				if(!key) return;

				// got a key! stop listening for new keys and finish up
				off(rsa.port, 'new-key', persona_key_wait);
				do_add_key(key);
			});
		}
	});
};

var open	=	function(options)
{
	if(!background) return false;

	options || (options = {});

	var controller	=	options.add ? 'PersonaEditController' : 'PersonasController';
	background.open(controller, {
		edit_in_modal: false,
		join: options.join		// if this is being opened via a fresh join, adjust the interface
	}, {
		width: 750,
		height: 175,
		force: options.force,
		already_open: function(port) {
			// load the main personas controller if already open
			port.emit('personas-main');
		}
	});
};

var destroy	=	function()
{
	background	=	false;
	rsa			=	false;
};

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;
