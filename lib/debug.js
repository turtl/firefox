/**
 * This library allows us to send code directly into the background page to
 * debug things better. It's a terrible, terrible idea to enable this because
 * it's a huge security hole. Only do this if you're actually debugging the app.
 */
var win_util	=	require('sdk/window/utils');
var { on, once, off, emit }	=	require('sdk/event/core');

var init	=	function(background)
{
	var chromewin	=	win_util.getMostRecentBrowserWindow();
	chromewin.turtldebug	=	{
		send: function(code) {
			emit(background.port, 'debug', code);
		}
	};
};

exports.init		=	init;

