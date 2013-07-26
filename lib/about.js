var data		=	require('sdk/self').data;
var base64		=	require("sdk/base64");
var request		=	require('sdk/request').Request;
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var join	=	require('sdk/panel').Panel({
	width: 400,
	height: 400,
	contentURL: data.url('about.html')
});
join.on('show', function() {
	join.port.emit('show');
});
join.on('hide', function() {
	join.port.emit('hide');
});
join.port.on('submit', function(test_auth, key) {
	var post	=	'data[a]='+encodeURIComponent(test_auth);
	request({
		url: config.api_url+'/users',
		onComplete: function(res) {
			var json	=	null;
			eval('json = '+res.text+';');
			if(res.status == 200)
			{
				join.port.emit('success', test_auth);
				emit(join, 'success', json.id, json.a, key);
				join.hide();
			}
			else
			{
				join.port.emit('fail', res.status, json);
			}
		}
	}).post();
});

on(join, 'logout', function() {
});

exports.join	=	join;



