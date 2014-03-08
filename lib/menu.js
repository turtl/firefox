/**
 * This library wraps the toolbarbutton and creates a standard interface for
 * initializing and displaying menu items for the main toolbar button.
 */

var data		=	require('sdk/self').data;
var Panel		=	require("sdk/panel");
var tb_button	=	require('toolbar-button-complete/toolbarbutton');
var { on, once, off, emit }	=	require('sdk/event/core');

var init	=	function(options)
{
	var button	=	false;

	// when called, returns the XUL element for the button, useful for attaching
	// panels to and whatnot
	var btn		=	function()
	{
		var btn	=	false;
		try
		{
			btn	=	button ? button.button() : false;
		}
		catch(e) { }
		return btn;
	};

	// set up button click callbacks via on_click
	var btn_click	=	function() {};
	var on_click	=	function(cb)
	{
		btn_click	=	function(e, btn)
		{
			if(e.target != btn) return false;
			cb(e, btn);
		};
	};

	// allows (re)setting of menu items. pass the items you wish to enable and
	// it will enable just those
	var update_menu		=	function(items)
	{
		button.updateMenu({
			id: options.id+'_menu',
			items: items
		});
	};

	var menu	=	null;
	if(options.menu)
	{
		menu	=	{
			id: options.id+'_menu',
			items: options.menu_items
		};
	}
	button	=	tb_button.ToolbarButton({
		id: options.id,
		label: options.label,
		tooltiptext: options.tooltiptext,
		image: options.image,
		menu: menu,
		onCommand: function(e, btn) { btn_click(e, btn); }
	});

	// if we're installing for the first time, move the button to the URL bar
	if(options.is_install)
	{
		button.moveTo({
			toolbarID: "nav-bar",
			forceMove: false
		});
	}

	var panel	=	Panel.Panel({
		width: 180,
		height: 200,
		contentURL: data.url('menu.html')
	});

	var menu_dispatch	=	function() {};
	var set_dispatch	=	function(cb)
	{
		menu_dispatch	=	cb;
	};

	panel.port.on('resize', function(height) {
		panel.resize(180, height);
	});
	panel.port.on('dispatch', function(href) {
		menu_dispatch(href);
	});

	panel.on('show', function() { panel.port.emit('open'); });

	var open	=	function(options)
	{
		options || (options = {});

		panel.show(btn());
	};
	var close	=	function()
	{
		panel.hide();
	};

	var destroy	=	function()
	{
		panel.destroy();
	};

	// package our shiny new button/menu
	return {
		btn: btn,
		button: function() { return button; },
		on_click: on_click,
		update_menu: update_menu,
		set_dispatch: set_dispatch,
		open: open,
		close: close,
		port: panel.port,
		destroy: destroy
	};
};

exports.Menu		=	init;

