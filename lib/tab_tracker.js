/**
 * The tab tracker keeps track of app tabs and which windows they're on. The
 * purpose being that you can only have one Turtl tab open per-window (as
 * opposed to any number ot Turtl tabs OR just one Turtl tab for all windows).
 */

var win_utils	=	require('sdk/window/utils');

var tabs	=	{};

var cur_window	=	function(options)
{
	options || (options = {});
	var window	=	win_utils.getMostRecentBrowserWindow();
	if(!options.id) return window;
	return win_utils.getOuterId(window);
};

var track	=	function(tab)
{
	var id		=	cur_window({id: true});
	tabs[id]	=	tab;
};

var untrack	=	function(tab)
{
	Object.keys(tabs).forEach(function(win) {
		var wintab	=	tabs[win];
		if(wintab != tab) return false;
		delete tabs[win];
	});
};

var exists	=	function()
{
	var id		=	cur_window({id: true});
	if(tabs && tabs[id]) return tabs[id];
	return false
};

var destroy	=	function()
{
	Object.keys(tabs).forEach(function(win) {
		var tab	=	tabs[win];
		tab.close();
	});
};

exports.track	=	track;
exports.untrack	=	untrack;
exports.exists	=	exists;
exports.destroy	=	destroy;
