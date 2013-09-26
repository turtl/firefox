/**
 * The user library is responsible for the login/join panel.
 *
 * It's important to note that this panel also initializes the RSA lib (must be
 * passed in on init) which is responsible for generating RSA keys. We do it
 * this way to save resources (the user panel already loads all the crypto libs,
 * so the rsa lib is tacked onto it in favor of creating a completely separate
 * page worker that loads all the same libs).
 */

var data		=	require('sdk/self').data;
var base64		=	require('sdk/base64');
var request		=	require('sdk/request').Request;
var Panel		=	require('sdk/panel');
var xhr_wrapper	=	require('xhr_wrapper');
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var rsa			=	false;
var user_panel	=	false;
var port		=	{};

var init	=	function(_rsa)
{
	if(user_panel) return;

	rsa				=	_rsa;

	user_panel	=	Panel.Panel({
		width: 750,
		height: 290,
		contentURL: data.url('user.html')
	});

	user_panel.on('show', function() {
		user_panel.port.emit('show');
	});
	user_panel.on('hide', function() {
		user_panel.port.emit('hide');
	});

	user_panel.port.on('login-success', function(id, auth, key) {
		emit(port, 'login-success', id, auth, key);
		user_panel.hide();
	});
	user_panel.port.on('join-success', function(id, auth, key) {
		emit(port, 'join-success', id, auth, key);
		user_panel.hide();
	});

	// run some stuff when we know the panel is all set up
	user_panel.port.on('loaded', function() {
		// set in any extra vars
		user_panel.port.emit('init', data.url('app'));

		// init our RSA lib once the user panel has finished setting up
		rsa.init(user_panel.port);
	});

	// make sure the panel can send XHR
	xhr_wrapper.wrap(user_panel.port);
};

var open	=	function(attach_to)
{
	user_panel.show(attach_to);
};

var destroy	=	function()
{
	if(!user_panel) return false;
	user_panel.destroy();
	user_panel	=	false;
};

exports.port	=	port;
exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;

