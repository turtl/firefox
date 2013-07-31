var PageWorker	=	require("sdk/page-worker")
var { on, once, off, emit }	=	require('sdk/event/core');

// holds the addon data handler object, which we'll be making updates to
var data_handler	=	null;

// holds the page worker for syncing
var worker	=	null;

// allows event/messaging for syncing system
var port	=	{};

/**
 * Initializes syncing and sets up the data handler
 */
var init	=	function(data_handler)
{
};

var start	=	function()
{
};

exports.init	=	init;
exports.start	=	start;
exports.port	=	port;

