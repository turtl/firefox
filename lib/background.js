/**
 * The background lib is the main application sync and panel process. It owns
 * one panel, which loads the entire Turtl app inside of it and not only syncs
 * between the API and the addon via messaging, but also allows the panel to be
 * opened to any controller via port messages.
 *
 * Before, there was a sync process which was never shown, a bookmarker lib/
 * panel, and various other app panels that used their own share of Turtl
 * resources. Now there is just one panel. It loads everything, and it can be
 * switched easily.
 */

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

// stores the name of the currently loaded panel controller
var cur_controller	=	null;

// if true, acts as the persistent object we attach the background panel to
var persist_attach	=	null;

// used to store functions that will be called when the background lib is ready
var ready_callbacks	=	[];

/**
 * Initializes syncing and sets up the data handler
 */
var init	=	function(data_handler, poller, options)
{
	options || (options = {});

	persist_attach	=	options.attach;

	// this "worker" houses our sync process. the decision to use a panel
	// instead of a page-worker was because we couldn't properly get the events
	// for the page-worker to talk to this lib, much less see any console
	// statements or debug it. panel works great, so that's what we're using.
	worker	=	Panel.Panel({
		width: 200,
		height: 200,
		contentURL: data.url('background.html')
	});

	// once the worker tells us it's ready to go, we send it the auth info
	worker.port.on('loaded', function() {
		worker.port.emit('init', data_handler.get('auth'), data.url('app'));
	});

	// mirror the profile to the data handler on save
	worker.port.on('profile-save', function(data) {
		data_handler.set({profile: data});
	});

	worker.port.on('profile-sync', function(data, forced) {
		emit(port, 'profile-sync', data, forced);
	});

	worker.port.on('profile-mod', function() {
		emit(port, 'do-sync');
	});

	worker.port.on('profile-load-complete', function() {
		if(options.onLoadComplete) options.onLoadComplete();
	});

	worker.port.on('resize', function() {
		worker.port.emit('get-height');
	});

	worker.port.on('set-height', function(height) {
		worker.resize(worker.width, height);
	});

	worker.port.on('addon-controller-release', function(controller_name) {
		if(controller_name == cur_controller)
		{
			cur_controller	=	null;
		}
	});

	worker.port.on('close', function() {
		worker.hide();
	});

	// run our ready callbacks
	ready_callbacks.forEach(function(cb) { cb(); });
	ready_callbacks	=	[];

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

		if(!worker) return false;
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

var open	=	function(controller, data, options)
{
	options || (options = {});
	if(!worker) return false;

	if(!options.attach && persist_attach)
	{
		if(typeof(persist_attach) == 'function')
		{
			options.attach	=	persist_attach();
		}
		else
		{
			options.attach	=	persist_attach;
		}
	}

	if(options.width || options.height)
	{
		worker.resize(options.width, options.height);
	}
	if(cur_controller == controller && !options.force)
	{
		if(options.already_open) options.already_open(worker.port);
		worker.show(options.attach);
		return;
	}
	cur_controller	=	controller;
	if(!data.inject) data.inject = '#background_content';
	worker.port.emit('addon-controller-open', controller, data);
	worker.show(options.attach);
};

var sync	=	function(on_off)
{
	on_off || (on_off = false);
	worker.port.emit(on_off ? 'start' : 'stop');
};

var ready	=	function(cb)
{
	if(worker)
	{
		cb();
	}
	else
	{
		ready_callbacks.push(cb);
	}
};

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	off(port);
	worker			=	false;
	ready_callbacks	=	[];
};

exports.port		=	port;
exports.init		=	init;
exports.open		=	open;
exports.sync		=	sync;
exports.panel_port	=	function() { return (worker && worker.port); };
exports.ready		=	ready;
exports.destroy		=	destroy;
