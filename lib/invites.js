/**
 * The invite library looks for invite URLs in current tabs as well as creates a
 * page worker to find invites in newly opened tabs.
 *
 * It takes any invite URLs it finds, parses out the values, ensures they are
 * valid (by calling to the API directly) and then adds them to the simple/
 * persistent addon storage system. This way, even if a user closes the browser
 * before accepting an invite, the invite will be there the next time they start
 * the browser/log in.
 */

var data	=	require('sdk/self').data;
var PageMod	=	require('sdk/page-mod');
var config	=	require('config').config;
var simple	=	require('sdk/simple-storage');
var tabs	=	require('sdk/tabs');
var request	=	require('sdk/request').Request;
var timer	=	require('timer');
var { on, once, off, emit }	=	require('sdk/event/core');
 
var worker			=	null;
var data_handler	=	null;
var regex			=	new RegExp('https?://'+config.site_url+'/invites/.*/.*/.*');
var port			=	{};

var background		=	null;

/**
 * Call out to the API to check if an invite exists/is valid. If so, call the
 * success function with the invite data.
 */
var invite_valid	=	function(code, id, success)
{
	request({
		url: config.api_url + '/invites/codes/'+code,
		content: {invite_id: id},
		onComplete: function(result) {
			if(200 <= result.status && result.status < 300)
			{
				success(JSON.parse(result.text));
			}
		}
	}).get();
}

var process_invite	=	function(code, id, key)
{
	// TODO: request invite against server. if valid, store it, open invites
	// dialog (with ALL stored invites). if invalid, ignore it and do nothing
	invite_valid(code, id, function(invite) {
		// add in the key
		invite.data.key	=	key;

		// add the invite to persistent storage
		simple.storage.invites[invite.id]	=	invite;

		// if user is logged in, open the invites panel
		if(data_handler.get('auth', false))
		{
			// user is logged in. show invites dialog
			exports.open();
		}
	});
};

var have_pending	=	function()
{
	return Object.keys(simple.storage.invites || {}).length > 0;
};

var init	=	function(_data_handler, _background)
{
	if(worker) return worker;

	if(!simple.storage.invites) simple.storage.invites = {};

	// are you a hip replacement VICTIM???? you may be ENTITLED to money!!!!1
	data_handler	=	_data_handler;
	background		=	_background;

	// signalled by the app when an invite is accepted or denied. either way,
	// get it out of our hair. note we add the listener only when the background
	// panel has a port ready for us to listen on
	background.ready(function() {
		background.panel_port().on('invite-remove', function(invite_id) {
			delete simple.storage.invites[invite_id];
		});
	});

	// give it a path with some invite data and this splits out the correct
	// values. helper function.
	var process_invite_path	=	function(path)
	{
		var code		=	path.replace(/.*\/invites\/([0-9a-f-]+)\/.*$/, '$1');
		var invite_id	=	path.replace(/.*\/invites\/[0-9a-f-]+\/([0-9a-f-]+)\/.*$/, '$1');
		var key			=	path.replace(/.*\/invites\/[0-9a-f-]+\/[0-9a-f-]+\/([0-9a-f-]+).*?$/, '$1');
		if(	code.match(/^[0-9a-f-]+$/) &&
			invite_id.match(/^[0-9a-f-]+$/) &&
			key.match(/^[0-9a-f-]+$/) )
		{
			process_invite(code, invite_id, key);
		}
	};

	// here we look for any tabs opening that match our invite processing page
	// URL
	worker	=	PageMod.PageMod({
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

var open	=	function()
{
	var invite_data	=	simple.storage.invites;
	background.open('InvitesListController', {}, {
		width: 600,
		height: 150
	});
	background.panel_port().emit('invites-populate', invite_data, data.url('app'));
};

var destroy	=	function()
{
	if(!worker) return false;
	worker.destroy();
	worker	=	null;
	off(port);
};

exports.have_pending	=	have_pending;
exports.init			=	init;
exports.open			=	open;
exports.port			=	port;
exports.destroy			=	destroy;

