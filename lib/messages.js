/**
 * The message library is really a piggyback onto the invites library. Since at
 * the moment, all messages are invites, they are mainly folded together. This
 * makes this library a simple wrapper around the background page's messages.
 */
var { on, once, off, emit }	=	require('sdk/event/core');

var data_handler	=	null;
var background		=	null;

var num_messages	=	0;
var port			=	{};

var init	=	function(_data_handler, _background)
{
	if(data_handler || background) return false;

	data_handler	=	_data_handler;
	background		=	_background;

	background.panel_port().on('num-messages', function(num) {
		num_messages	=	num;
		emit(port, 'num-messages', num);
	});
}

var num_pending	=	function()
{
	return num_messages;
};

var have_pending	=	function()
{
	return num_pending() > 0;
};

var destroy	=	function()
{
	// ok, since panel ports don't have a standard event interface (yay). we
	// pretty much can't remove our listeners. this is ok though, because if we
	// are calling personas.destroy, the background is getting destroyed too...
	//background.panel_port().off('num-messages');
	data_hander	=	null;
	background	=	null;
};

exports.init			=	init;
exports.num_pending		=	num_pending;
exports.have_pending	=	have_pending;
exports.port			=	port;
exports.destroy			=	destroy;

