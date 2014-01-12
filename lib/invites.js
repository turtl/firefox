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

var data			=	require('sdk/self').data;
var PageMod			=	require('sdk/page-mod');
var config			=	require('config').config;
var simple			=	require('sdk/simple-storage');
var tabs			=	require('sdk/tabs');
var request			=	require('sdk/request').Request;
var timer			=	require('timer');
var notifications	=	require('sdk/notifications');
var { on, once, off, emit }	=	require('sdk/event/core');
 
var data_handler	=	null;
var background		=	null;
var personas		=	null;
var messages		=	null;

var worker			=	null;
var regex			=	new RegExp('https?://'+config.site_url+'/invites/.*/.*/.*');
var port			=	{};

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
	invite_valid(code, id, function(invite) {
		// add in the key
		invite.data.key	=	key;

		// add the invite to persistent storage
		simple.storage.invites[invite.id]	=	invite;

		port.emit('num-invites', Object.keys(simple.storage.invites).length);

		// if user is logged in, open the invites panel
		if(data_handler.get('auth', false))
		{
			// user is logged in. show invites dialog
			exports.open();
		}
	});
};

var num_pending		=	function()
{
	return Object.keys(simple.storage.invites || {}).length;
};

var have_pending	=	function()
{
	return num_pending() > 0;
};

var remove	=	function(invite_id)
{
	delete simple.storage.invites[invite_id];
	emit(port, 'num-invites', num_pending());
};

var init	=	function(_data_handler, _background, _personas, _messages)
{
	if(worker) return worker;

	if(!simple.storage.invites) simple.storage.invites = {};

	// are you a hip replacement VICTIM???? you may be ENTITLED to money!!!!1
	data_handler	=	_data_handler;
	background		=	_background;
	personas		=	_personas;
	messages		=	_messages;

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

var notify	=	function()
{
	if(!have_pending() && !messages.have_pending()) return false;
	if(personas.num_personas() == 0) return false;
	notifications.notify({
		title: 'You have invites',
		text: 'Open the `Invites` dialog in the Turtl menu to start sharing.',
		data: '',
		iconURL: data.url('app/images/favicon.128.png'),
		onClick: function(data) {
		}
	});
};

var destroy	=	function()
{
	if(!worker) return false;
	data_handler	=	null;
	background		=	null;
	personas		=	null;
	messages		=	null;
	worker.destroy();
	worker	=	null;
	off(port);
};

exports.num_pending		=	num_pending;
exports.have_pending	=	have_pending;
exports.remove			=	remove;
exports.init			=	init;
exports.open			=	open;
exports.port			=	port;
exports.notify			=	notify;
exports.destroy			=	destroy;

