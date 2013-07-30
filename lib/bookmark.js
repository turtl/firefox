var data		=	require('sdk/self').data;

var bookmark	=	require('sdk/panel').Panel({
	width: 650,
	height: 150,
	contentURL: data.url('bookmark.html')
});

exports.bookmark	=	bookmark;

