/**
 * This module slightly mimicks models in Composer (mainly regarding the get/set
 * event propagation). Is a very stripped down version that works for simpler
 * purposes.
 *
 * The idea is that there's a central store for profile/user/etc data in the 
 * addon. Note that all data in this library/object is stored encrypted, and
 * only decrypted when it's pumped into the background panel or the app tab.
 */

var data	=	{};
var { on, once, off, emit }	=	require('sdk/event/core');

// used for events
var port	=	{};

var get	=	function(key, default_val)
{
	default_val || (default_val = null);
	var res	=	data[key];
	if(typeof res == 'undefined')
	{
		return default_val;
	}
	return res;
};

var set	=	function(object)
{
	object || (object = {});
	var keys	=	Object.keys(object);
	for(var i = 0, n = keys.length; i < n; i++)
	{
		var key		=	keys[i];
		var val		=	object[key];
		data[key]	=	val;
		emit(port, 'change:'+key, val);
	}
	emit(port, 'change');
};

var unset	=	function(key)
{
	delete data[key];
	emit(port, 'change:'+key, void 0);
	emit(port, 'change');
};

exports.port	=	port;
exports.get		=	get;
exports.set		=	set;
exports.unset	=	unset;

