var data		=	require('sdk/self').data;
var { on, once, off, emit }	=	require('sdk/event/core');

var background	=	false;
var rsa			=	false;

var num_personas	=	0;

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
			background.panel_port().emit('persona-attach-key', key, persona_data);
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
			if(!rsa.generating_key()) rsa.new_key();
			on(rsa.port, 'new-key', function() {
				// try to grab a new key
				var key	=	rsa.pop_key();

				// nope, didn't get a key this time (someone might have been
				// ahead of us in line)
				if(!key)
				{
					if(!rsa.generating_key()) rsa.new_key();
				}

				// got a key! stop listening for new keys and finish up
				off(rsa.port, 'new-key', arguments.callee);
				do_add_key(key);
			});
		}
	});
	background.panel_port().on('num-personas', function(num) {
		num_personas	=	num;
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
	// ok, since panel ports don't have a standard event interface (yay). we
	// pretty much can't remove our listeners. this is ok though, because if we
	// are calling personas.destroy, the background is getting destroyed too...
	//background.panel_port().removeListener('personas-add-open');
	//background.panel_port().removeListener('persona-created');
	//background.panel_port().removeListener('persona-deleted');
	background	=	false;
	rsa			=	false;
};

exports.init			=	init;
exports.open			=	open;
exports.num_personas	=	function() { return num_personas; };
exports.destroy			=	destroy;
