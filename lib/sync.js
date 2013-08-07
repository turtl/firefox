var data			=	require('sdk/self').data;
var Panel			=	require("sdk/panel");
var xhr_wrapper		=	require('xhr_wrapper');
var poller			=	require('poller');
var timer			=	require('timer');
var { on, once, off, emit }	=	require('sdk/event/core');

// holds the page worker for syncing
var worker	=	null;

// allows events/messaging for syncing system
var port	=	{};

/**
 * Initializes syncing and sets up the data handler
 */
var init	=	function(data_handler, poller, options)
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

	worker.port.on('profile-sync', function(data, forced) {
		emit(port, 'profile-sync', data, forced);
	});

	worker.port.on('profile-load-complete', function() {
		if(options.onLoadComplete) options.onLoadComplete();
	});

	// this is set up to make sure syncing is not done more than once every few
	// seconds. do_sync self-regulates how much it is called, and if it feels
	// it is being bothered too much, it stops syncing for a while.
	//
	// allows "forcing" the sync, which will sync with the API whether the rate
	// limit is reached or not.
	var disable_sync	=	false;
	var do_sync			=	function(options)
	{
		options || (options = {});

		if(disable_sync && !options.force) return false;
		worker.port.emit('do-sync');

		if(!options.force)
		{
			disable_sync	=	true;
			timer.setTimeout(function() { disable_sync = false; }, 2000);
		}
	};

	// setup a timer that syncs with the API every 10s
	var sync_timer	=	poller.timer(10000, function() {
		if(!worker) return;
		do_sync({force: true});		// note the force
		sync_timer.reset();
	});
	sync_timer.start();

	// we got a humble request to sync with the API. consider it.
	on(port, 'do-sync', function() {
		do_sync();
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

