var data		=	require('sdk/self').data;
var base64		=	require("sdk/base64");
var request		=	require('sdk/request').Request;
var tabs		=	require('sdk/tabs');
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var about	=	require('sdk/panel').Panel({
	width: 400,
	height: 224,
	contentURL: data.url('about.html')
});

about.port.on('clicked', function(href) {
	about.hide();
	tabs.open({ url: href });
});

exports.about	=	about;



