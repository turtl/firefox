var data		=	require('sdk/self').data;
var tabs		=	require('sdk/tabs');
var Panel		=	require("sdk/panel");
var xhr_wrapper	=	require('xhr_wrapper');
var { on, once, off, emit }	=	require('sdk/event/core');

var background	=	false;

var init	=	function(data_handler, _background, options)
{
	options || (options = {});

	background	=	_background;
};

var open	=	function(attach_to)
{
	attach_to || (attach_to = null);
	var tab		=	tabs.activeTab;
	var title	=	tab.title;
	var url		=	tab.url;
	var type	=	tab.contentType.match(/^image/) ? 'image' : 'link';
	var do_open	=	function(tabdata)
	{
		var text	=	'';
		if(tabdata.image && tabdata.image != '')
		{
			text	+=	'![image]('+tabdata.image+')  \n';
		}
		if(tabdata.desc) text += tabdata.desc;
		var linkdata	=	{
			title: type == 'image' ? '' : tab.title,
			url: tab.url,
			type: type,
			text: text
		};

		background.open('BookmarkController', {
			inject: '#main',
			linkdata: linkdata,
		}, {
			width: 750,
			height: 300,
			attach: attach_to,
			already_open: function(port) {
				port.emit('bookmark-open', linkdata);
			}
		});
	};
	if(type == 'image')
	{
		do_open({});
	}
	else
	{
		var worker	=	tab.attach({
			contentScriptFile: data.url('bookmark.image.js')
		});
		worker.port.on('scraped', function(data) {
			do_open(data);
			worker.destroy();
		});
	}
};

var destroy	=	function()
{
}

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;

