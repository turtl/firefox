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
var Panel			=	require('sdk/panel');
var xhr_wrapper		=	require('xhr_wrapper');
var poller			=	require('poller');
var timer			=	require('timer');
var config			=	require('config').config;
var { on, once, off, emit }	=	require('sdk/event/core');

// holds the page worker for syncing
var worker	=	null;

// allows events/messaging for syncing system
var port	=	{};

// stores the name of the currently loaded panel controller
var cur_controller	=	null;

// if true, acts as the persistent object we attach the background panel to
var persist_attach	=	null;

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
		contentURL: data.url('background.html'),
	});

	worker.port.on('pre-load', function() {
		worker.port.emit('set-config', config);
	});

	// once the worker tells us it's ready to go, we send it the auth info
	worker.port.on('loaded', function() {
		worker.port.emit('init', data_handler.get('auth'), data.url('app'));
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

	if(config.debug)
	{
		on(port, 'debug', function(code) {
			if(config.debug) worker.port.emit('debug', code);
		});
	}

	// forward close events
	worker.on('hide', function() { emit(port, 'close'); });

	// make sure the panel can send XHR
	xhr_wrapper.wrap(worker.port);
};

/**
 * Open the background panel and load a Turtl app controller inside of it. This
 * allows us to pass parameters directly to the controller so we can control how
 * it instantiates. If also detects if the controller is already open, and if
 * so, fires a callback witht he background port as an argument
 * (options.already_open).
 */
var open	=	function(controller, data, options)
{
	options || (options = {});
	options.force	=	true;
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

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	off(port);
	worker			=	false;
};

exports.port		=	port;
exports.init		=	init;
exports.open		=	open;
exports.sync		=	sync;
exports.panel_port	=	function() { return (worker && worker.port); };
exports.destroy		=	destroy;

