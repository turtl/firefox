var data		=	require('sdk/self').data;

var bookmark	=	require('sdk/panel').Panel({
	width: 232,
	height: 150,
	contentURL: data.url('bookmark.html')
});

exports.bookmark	=	bookmark;

