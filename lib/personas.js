var data		=	require('sdk/self').data;

var background	=	false;

var init	=	function(_background)
{
	background	=	_background;

	background.panel_port().on('personas-add-open', function() {
		exports.open({add: true, force: true});
	});
};

var open	=	function(options)
{
	if(!background) return false;

	options || (options = {});

	var controller	=	options.add ? 'PersonaEditController' : 'PersonasController';
	background.open(controller, {
		edit_in_modal: false
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
};

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;
