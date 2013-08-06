var timer		=	require('timer');

// determines if the poller is enabled or not. meant to be set by set_enable_cb
var enable_cb	=	function() { return false; };
var functions	=	[];

var set_enable_cb	=	function(cb)
{
	enable_cb	=	cb;
	return true;
};

var add_poller	=	function(fn)
{
	functions.push(fn);
};

var remove_poller	=	function(fn)
{
	var idx		=	functions.indexOf(fn);
	if(idx == -1) return;
	var fns		=	functions.slice(0, idx).concat(functions.slice(idx + 1));
	functions	=	fns
};

var clear_pollers	=	function()
{
	functions	=	[];
};

var poll	=	function()
{
	if(!enable_cb()) return false;
	for(var i = 0, n = functions.length; i < n; i++)
	{
		var fn	=	functions[i];
		fn();
	}
	timer.setTimeout(poll, 100);
};

exports.set_enable_cb	=	set_enable_cb;
exports.add_poller		=	add_poller;
exports.remove_poller	=	remove_poller;
exports.clear_pollers	=	clear_pollers;
exports.poll			=	poll;

