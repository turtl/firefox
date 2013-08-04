var data		=	require('sdk/self').data;
var Panel		=	require("sdk/panel");
var xhr_wrapper	=	require('xhr_wrapper');
var { on, once, off, emit }	=	require('sdk/event/core');

var bookmark	=	false;

var init	=	function(data_handler, sync, options)
{
	if(bookmark) return bookmark;

	options || (options = {});

	var width	=	750;
	bookmark	=	Panel.Panel({
		width: width,
		height: 300,
		contentURL: data.url('bookmark.html')
	});

	// when loaded, send in auth/profile and init
	bookmark.port.on('loaded', function() {
		bookmark.port.emit('init', data_handler.get('auth'), data_handler.get('profile'));
	});

	// setup bookmark syncing
	on(sync.port, 'profile-sync', function(data) {
		if(!bookmark) return false;
		bookmark.port.emit('profile-sync', data);
	});

	bookmark.port.on('profile-load-complete', function() {
		if(options.onLoadComplete) options.onLoadComplete();
	});

	bookmark.port.on('set-height', function(height) {
		bookmark.resize(width, height);
	});

	bookmark.port.on('close', function() {
		bookmark.hide();
	});

	// make sure the panel can send XHR
	xhr_wrapper.wrap(bookmark.port, {log: true});

	return bookmark;
};

var open	=	function(attach_to)
{
	if(!bookmark) return false;
	attach_to || (attach_to = null);
	bookmark.show(attach_to);
	bookmark.port.emit('open');
};

var destroy	=	function()
{
	if(!bookmark) return false;
	bookmark.destroy();
	bookmark	=	false;
}

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;

