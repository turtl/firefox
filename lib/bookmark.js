var data		=	require('sdk/self').data;
var tabs		=	require('sdk/tabs');
var Panel		=	require("sdk/panel");
var xhr_wrapper	=	require('xhr_wrapper');
var { on, once, off, emit }	=	require('sdk/event/core');

var bookmark	=	false;

var init	=	function(data_handler, sync, options)
{
	if(bookmark) return bookmark;

	options || (options = {});

	var width	=	750;
	bookmark	=	Panel.Panel({
		width: width,
		height: 300,
		contentURL: data.url('bookmark.html')
	});

	// when loaded, send in auth/profile and init
	bookmark.port.on('loaded', function() {
		bookmark.port.emit('init', data_handler.get('auth'), data_handler.get('profile'));
	});

	// setup bookmark syncing
	on(sync.port, 'profile-sync', function(data, forced) {
		if(!bookmark) return false;
		bookmark.port.emit('profile-sync', data, forced);
	});
	bookmark.port.on('profile-mod', function() {
		console.log('bm: profile mod');
		emit(sync.port, 'do-sync');
	});

	bookmark.port.on('profile-load-complete', function() {
		if(options.onLoadComplete) options.onLoadComplete();
	});

	bookmark.port.on('set-height', function(height) {
		bookmark.resize(width, height);
	});

	bookmark.port.on('close', function() {
		bookmark.hide();
	});

	// make sure the panel can send XHR
	xhr_wrapper.wrap(bookmark.port, {log: true});

	return bookmark;
};

var open	=	function(attach_to)
{
	if(!bookmark) return false;
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
		bookmark.port.emit('open', linkdata);
		bookmark.show(attach_to);
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
			// TODO: why does port have no off?
			//worker.port.off('scraped');
			do_open(data);
		});
	}
};

var destroy	=	function()
{
	if(!bookmark) return false;
	bookmark.destroy();
	bookmark	=	false;
}

exports.init	=	init;
exports.open	=	open;
exports.destroy	=	destroy;

