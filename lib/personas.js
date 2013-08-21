var data		=	require('sdk/self').data;

var background	=	false;

var init	=	function(_background)
{
	background	=	_background;
};

var open	=	function(attach_to)
{
	if(!background) return false;

	background.open('PersonasController', {
		edit_in_modal: false
	}, {
		width: 750,
		height: 175,
		attach: attach_to,
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
