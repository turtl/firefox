/**
 * The message library is really a piggyback onto the invites library. Since at
 * the moment, all messages are invites, they are mainly folded together. This
 * makes this library a simple wrapper around the background page's messages.
 */

var data_handler	=	null;
var background		=	null;

var init	=	function(_data_handler, _background)
{
	if(data_handler || background) return false;

	data_handler	=	_data_handler;
	background		=	_background;
}

var destroy	=	function()
{
	data_hander	=	null;
	background	=	null;
};

exports.init	=	init;
exports.destroy	=	destroy;
