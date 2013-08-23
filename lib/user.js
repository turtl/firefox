/**
 * The user library is responsible for the login/join panel.
 */

var data		=	require('sdk/self').data;
var base64		=	require('sdk/base64');
var request		=	require('sdk/request').Request;
var Panel		=	require('sdk/panel');
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var user_panel	=	false;
var port		=	{};

var init	=	function()
{
	if(user_panel) return;

	user_panel	=	Panel.Panel({
		width: 750,
		height: 350,
		contentURL: data.url('login-join.html')
	});

	user_panel.on('show', function() {
		user_panel.port.emit('show');
	});
	user_panel.on('hide', function() {
		user_panel.port.emit('hide');
	});

	user_panel.port.on('login-submit', function(test_auth, key) {
		var headers	=	{
			'Authorization': 'Basic ' + base64.encode('user:' + test_auth)
		};
		request({
			url: config.api_url+'/auth',
			headers: headers,
			onComplete: function(res) {
				var json	=	JSON.parse(res.text);
				if(res.status == 200)
				{
					user_panel.port.emit('login-success', test_auth);
					emit(port, 'login-success', json, test_auth, key);
					user_panel.hide();
				}
				else
				{
					user_panel.port.emit('login-fail', res.status, json);
				}
			}
		}).post();
	});

	user_panel.port.on('join-submit', function(test_auth, key) {
		var post	=	'data[a]='+encodeURIComponent(test_auth);
		request({
			url: config.api_url+'/users',
			content: post,
			onComplete: function(res) {
				var json	=	JSON.parse(res.text);
				if(res.status == 200)
				{
					user_panel.port.emit('join-success', test_auth);
					emit(port, 'join-success', json.id, json.a, key);
					user_panel.hide();
				}
				else
				{
					user_panel.port.emit('join-fail', res.status, json);
				}
			}
		}).post();
	});
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

