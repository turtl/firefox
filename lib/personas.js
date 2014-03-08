var data		=	require('sdk/self').data;
var { on, once, off, emit }	=	require('sdk/event/core');

var background	=	false;

var num_personas	=	0;

var init	=	function(_background)
{
	background	=	_background;

	background.panel_port().on('personas-add-open', function() {
		exports.open({add: true, force: true});
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
};

exports.init			=	init;
exports.open			=	open;
exports.num_personas	=	function() { return num_personas; };
exports.destroy			=	destroy;
