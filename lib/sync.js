var data		=	require('sdk/self').data;
var PageWorker	=	require("sdk/page-worker");
var { on, once, off, emit }	=	require('sdk/event/core');

// holds the addon data handler object, which we'll be making updates to
var data_handler	=	null;

// holds the page worker for syncing
var worker	=	null;

// allows events/messaging for syncing system
var port	=	{};

/**
 * Initializes syncing and sets up the data handler
 */
var init	=	function(datahandler)
{
	data_handler	=	datahandler;
	worker			=	PageWorker.Page({
		contentUrl: data.url('sync.html'),
		contentScriptFile: data.url('sync.js'),
		contentScriptWhen: 'end',
		contentScriptOptions: {
			auth: data_handler.get('auth')
		}
	});
};

/**
 * Start syncing: pulls down profile data every 10 seconds.
 */
var start	=	function()
{
};

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	worker	=	false;
};

exports.port	=	port;
exports.init	=	init;
exports.start	=	start;
exports.destroy	=	destroy;

