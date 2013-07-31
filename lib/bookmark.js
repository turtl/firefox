var data		=	require('sdk/self').data;
var config		=	require('config').config;
var bookmark	=	false;

var create_panel	=	function()
{
	return require('sdk/panel').Panel({
		width: 650,
		height: 150,
		contentURL: data.url('bookmark.html'),
		onHide: function() {
			if(!config.bookmark.persist)
			{
				bookmark.destroy();
				bookmark	=	false;
			}
		}
	});
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

if(config.bookmark.persist) bookmark = create_panel();

exports.open	=	open;
exports.close	=	close;

