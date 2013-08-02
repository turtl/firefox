var data		=	require('sdk/self').data;
var config		=	require('config').config;
var bookmark	=	false;

var create_panel	=	function()
{
	var width	=	750;
	var panel	=	require('sdk/panel').Panel({
		width: width,
		height: 300,
		contentURL: data.url('bookmark.html')
	});
	panel.port.on('more-height', function(height) {
		panel.resize(width, height);
	});
	return panel;
};

var open	=	function(attach_to)
{
	if(!bookmark) bookmark = create_panel();

	if(attach_to)
	{
		bookmark.show(attach_to);
	}
	else
	{
		bookmark.show();
	}

	return bookmark;
};

var close	=	function()
{
	bookmark.hide();
}

var sync	=	function(data)
{
	bookmark.port.emit('profile-sync', data);
};


bookmark	=	create_panel();

exports.open	=	open;
exports.close	=	close;
exports.sync	=	sync;

