var data			=	require('sdk/self').data;
var Panel			=	require("sdk/panel");
var xhr_wrapper		=	require('xhr_wrapper');
var { on, once, off, emit }	=	require('sdk/event/core');

// holds the page worker for syncing
var worker	=	null;

// allows events/messaging for syncing system
var port	=	{};

/**
 * Initializes syncing and sets up the data handler
 */
var init	=	function(data_handler, options)
{
	options || (options = {});

	// this "worker" houses our sync process. the decision to use a panel
	// instead of a page-worker was because we couldn't properly get the events
	// for the page-worker to talk to this lib, much less see any console
	// statements or debug it. panel works great, so that's what we're using.
	worker	=	Panel.Panel({
		width: 200,
		height: 200,
		contentURL: data.url('sync.html')
	});

	// once the worker tells us it's ready to go, we send it the auth info
	worker.port.on('loaded', function() {
		worker.port.emit('init', data_handler.get('auth'));
	});

	// mirror the profile to the data handler on save
	worker.port.on('profile-save', function(data) {
		data_handler.set({profile: data});
	});

	worker.port.on('profile-sync', function(data) {
		emit(port, 'profile-sync', data);
	});

	worker.port.on('profile-load-complete', function() {
		if(options.onLoadComplete) options.onLoadComplete();
	});

	// make sure the panel can send XHR
	xhr_wrapper.wrap(worker.port);
};

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	worker	=	false;
};

exports.port	=	port;
exports.init	=	init;
exports.destroy	=	destroy;

