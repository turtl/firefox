var port	=	new FirefoxAddonPort(addon.port);

var menu	=	{
	reset_height: function()
	{
		// reset the box height
		(function() {
			var height	=	document.body.getElement('.menu-wrap').getCoordinates().height;
			addon.port.emit('resize', height);
		}).delay(10, this);
	}
};

window.addEvent('domready', function() {
	var menu_ul	=	document.getElement('ul.app-menu');
	if(!menu_ul) return false;

	// bind our menu items to the dispatch function LOLOLOL
	menu_ul.addEvent('click:relay(a)', function(e) {
		if(e) e.stop();
		if(!e.target) return false;
		var href	=	e.target.href.replace(/^.*#/, '');
		port.send('dispatch', href);
	});

	// make sure menu is the right size on load
	port.bind('open', menu.reset_height);

	// update invite/message count (they are folded together for now)
	var num_invites		=	0;
	var num_messages	=	0;
	var invites_tag		=	menu_ul.getElement('a.invites');
	var invites_orig	=	invites_tag.get('html');
	var update_msg_count	=	function()
	{
		var num_total	=	num_invites + num_messages;
		var html		=	invites_orig;
		if(num_total > 0)
		{
			html	+=	' ('+num_total+')';
			invites_tag.setStyle('font-weight', 'bold');
		}
		else
		{
			invites_tag.setStyle('font-weight', '');
		}
		invites_tag.set('html', html);
	};
	port.bind('num-messages', function(num) {
		num_messages	=	num;
		update_msg_count();
	});
	port.bind('num-invites', function(num) {
		num_invites		=	num;
		update_msg_count();
	});
});

