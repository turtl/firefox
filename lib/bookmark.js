var data		=	require('sdk/self').data;
var tabs		=	require('sdk/tabs');

var background	=	false;

var init	=	function(_background)
{
	background	=	_background;
};

var open	=	function(attach_to)
{
	if(!background) return false;

	attach_to || (attach_to = null);
	var tab		=	tabs.activeTab;
	var title	=	tab.title;
	var url		=	tab.url;
	var type	=	tab.contentType.match(/^image/) ? 'image' : 'link';

	// call this when we have all the data we need to open the panel and
	// populate the bookmarker form(s)
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

		// open the bookmarker in the background panel
		background.open('BookmarkController', {
			linkdata: linkdata,
		}, {
			width: 750,
			height: 300,
			attach: attach_to,
			already_open: function(port) {
				// if the bookmarker is already the active panel controller,
				// send it a quick message to update with the linkdata
				port.emit('bookmark-open', linkdata);
			}
		});
	};

	if(type == 'image')
	{
		// if the page we're on is an image, we don't need to scrape any HTML
		// or anything, so open the panel with the info we already have
		do_open({});
	}
	else
	{
		// we're scraping a page for meta description and images, attach our
		// scraper to the current tab and open the panel once the scrape is
		// complete
		var worker	=	tab.attach({
			contentScriptFile: data.url('bookmark.scrape.js')
		});
		worker.port.on('scraped', function(data) {
			do_open(data);
			// don't need this no more
			worker.destroy();
		});
	}
};

var destroy	=	function()
{
	background	=	false;
};

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;

