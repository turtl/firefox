var data	=	require('sdk/self').data;
var pagemod	=	require('sdk/page-mod');
var config	=	require('config').config;
var simple	=	require('sdk/simple-storage');
var tabs	=	require('sdk/tabs');
 
var worker			=	null;
var data_handler	=	null;
var regex			=	new RegExp('https?://'+config.site_url+'/invites/.*');

var process_invite	=	function(code, id)
{
	// TODO: request invite against server. if valid, store it, open invites
	// dialog (with ALL stored invites). if invalid, ignore it and do nothing
	console.log('process invite: ', code, id);
	if(data_handler.get('auth', false))
	{
		// user is logged in. show invites dialog
		//open_invites(simple.storage.invites);
	}
	else
	{
		// user isn't logged in, so wait until they are logged into
		// and account before processing invites. note that we use
		// persistent storage here.
		if(!simple.storage.invites) simple.storage.invites = {};
		simple.storage.invites[id]	=	code;
	}
};

var init	=	function(datahandler)
{
	if(worker) return worker;

	// are you a hip replacement VICTIM???? you may be ENTITLED to money!!!!1
	data_handler	=	datahandler;

	// give it a path with some invite data and this splits out the correct
	// values. helper function.
	var process_invite_path	=	function(path)
	{
		var code		=	path.replace(/.*\/invites\/([0-9a-f-]+)\/.*/, '$1');
		var invite_id	=	path.replace(/.*\/invites\/[0-9a-f-]+\/([0-9a-f-]+).*?/, '$1');
		if(code.match(/^[0-9a-f-]+$/) && invite_id.match(/^[0-9a-f-]+$/))
		{
			process_invite(code, invite_id);
		}
	};

	// here we look for any tabs opening that match our invite processing page
	// URL
	worker	=	pagemod.PageMod({
		include: regex,
		contentScript: 'self.port.emit("path", window.location.pathname);',
		onAttach: function(worker) {
			worker.port.on('path', function(path) {
				process_invite_path(path);
			});
		}
	});

	// note only do we look for invites on new tabs, but also loop over all
	// current tabs and find any matching (existing) tabs. this allows a user
	// to install the addon from an invite page and have the addon track the
	// invite instantly.
	for(var i = 0, n = tabs.length; i < n; i++)
	{
		var tab	=	tabs[i];
		var url	=	tab.url;
		if(!regex.exec(url)) continue;

		var path		=	url.replace(/^[a-z]+:\/\/[^\/]+/, '');
		process_invite_path(path);
	}
	return worker;
};

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	worker	=	null;
};

exports.init	=	init;
exports.destroy	=	destroy;

