var data		=	require('sdk/self').data;
var base64		=	require("sdk/base64");
var request		=	require('sdk/request').Request;
var tabs		=	require('sdk/tabs');
var Panel		=	require('sdk/panel');
var { on, once, off, emit }	=	require('sdk/event/core');

var config		=	require('config').config;

var about	=	Panel.Panel({
	width: 400,
	height: 224,
	contentURL: data.url('about.html')
});

exports.about	=	about;



