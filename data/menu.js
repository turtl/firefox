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
	menu.reset_height();
	port.bind('open', menu.reset_height);

	// update invite/message count (they are folded together for now)
	var update_msg_count	=	function(num_invites, num_messages)
	{
		var num_invites		=	0;
		var num_messages	=	0;
		var num_total		=	num_invites + num_messages;
		if(num_total > 0)
		{
			var atag	=	menu_ul.getElement('a.invites');
			atag.set('html', atag.get('html') + ' ('+ num_total +')');
			atag.setStyle('font-weight', 'bold');
		}
	};
	port.bind('invites', update_msg_count);

	// update for RSA generation
	var rsagen	=	document.body.getElement('.rsa-gen');
	var update_rsa_gen	=	function()
	{
		var is_gen	=	app.ext.personas.generating_key;
		if(!menu.in_menu) return false;
		if(!rsagen) return;
		rsagen.setStyle('display', is_gen ? 'block' : '');
		menu.reset_height();
	};
	port.bind('rsa-gen', update_rsa_gen);
	port.bind('rsa-key', update_rsa_gen);
	port.bind('rsa-pop', update_rsa_gen);
	update_rsa_gen();
	var inp_rsa	=	rsagen.getElement('input[name=notify-rsa]');
	if(inp_rsa)
	{
		inp_rsa.checked	=	app.ext.personas.notify_rsa_gen;
		inp_rsa.addEvent('change', function(e) {
			var inp	=	e.target;
			var on	=	inp.checked;
			port.send('notify-rsa', on);
		});
	}
});

