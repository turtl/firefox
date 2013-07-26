var data		=	require('sdk/self').data;
var base64		=	require("sdk/base64");
var request		=	require('sdk/request').Request;
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var login	=	require('sdk/panel').Panel({
	width: 232,
	height: 152,
	contentURL: data.url('login.html')
});
login.on('show', function() {
	login.port.emit('show');
});
login.on('hide', function() {
	login.port.emit('hide');
});
login.port.on('submit', function(test_auth, key) {
	var headers	=	{
		'Authorization': 'Basic ' + base64.encode('user:' + test_auth)
	};
	request({
		url: config.api_url+'/auth',
		headers: headers,
		onComplete: function(res) {
			var json	=	null;
			eval('json = '+res.text+';');
			if(res.status == 200)
			{
				login.port.emit('success', test_auth);
				emit(login, 'success', json, test_auth, key);
				login.resize(232, 60);
				login.hide();
			}
			else
			{
				login.port.emit('fail', res.status, json);
			}
		}
	}).post();
});

on(login, 'logout', function() {
	login.resize(232, 150);
});

exports.login	=	login;

