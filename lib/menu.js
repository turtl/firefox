var data		=	require('sdk/self').data;
var tb_button	=	require('toolbar-button-complete/toolbarbutton');
var { on, once, off, emit }	=	require('sdk/event/core');

var init	=	function(options)
{
	var button	=	false;
	var btn		=	function(win)
	{
		if(win && win.document)
		{
			console.log('yay');
			return win.document.getElementById(options.id);
		}
		var btn	=	false;
		try
		{
			btn	=	button ? button.button() : false;
		}
		catch(e) { }
		return btn;
	};
	var btn_click	=	function() {};
	var on_click	=	function(cb) { btn_click = cb; };

	var update_menu		=	function(items)
	{
		button.updateMenu({
			id: options.id+'_menu',
			items: items
		});
	};

	button	=	tb_button.ToolbarButton({
		id: options.id,
		label: options.label,
		tooltiptext: options.tooltiptext,
		image: options.image,
		menu: {
			id: options.id+'_menu',
			items: options.menu_items
		},
		onCommand: function(xul_btn) {
			btn_click();
		}
	});

	if(options.is_install)
	{
		button.moveTo({
			toolbarID: "nav-bar",
			forceMove: false
		});
	}

	return {
		btn: btn,
		on_click: on_click,
		update_menu: update_menu
	};
};

exports.Menu		=	init;

