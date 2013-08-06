// TODO: https://developer.mozilla.org/en-US/docs/XUL/School_tutorial/Adding_Toolbars_and_Toolbar_Buttons?redirectlocale=en-US&redirectslug=XUL_School%2FAdding_Toolbars_and_Toolbar_Buttons#Adding_toolbar_buttons_to_existing_toolbars
//       (make toolbar button active on first time run)
var win_utils	=	require('window-utils');
var win_utils	=	require('sdk/window/utils');
var data		=	require('sdk/self').data;
var { on, once, off, emit }	=	require('sdk/event/core');

var is_init		=	false;
var document	=	null;
var menu_btn	=	null;
var menu_drop	=	null;
var menu_items	=	{
	tagit_login: {
		label: 'Login',
		bold: true
	},
	tagit_join: {
		label: 'Create account',
		image: data.url('app/images/site/icons/join_16x16_black.png')
	},
	tagit_bookmark: {
		label: 'Bookmark this page',
		bold: true,
		image: data.url('app/images/site/icons/bookmark_16x16.png')
	},
	tagit_app: {
		label: 'Open tagit',
		image: data.url('app/favicon.png')
	},
	tagit_logout: {
		label: 'Logout'
	},
	tagit_about: {
		label: 'About'
	},
	tagit_help: {
		label: 'Help',
		image: data.url('app/images/site/icons/help_16x16_black.png')
	},
};

var init	=	function()
{
	if(is_init) return false;
	var window	=	win_utils.getMostRecentBrowserWindow();
	document	=	window.document;

	var btn = document.createElement('toolbarbutton');  
	btn.setAttribute('id', 'tagit_button'); 
	btn.setAttribute('type', 'menu-button');  
	btn.setAttribute('label', 'Tagit');
	btn.setAttribute('class', 'toolbarbutton-1'); 
	btn.setAttribute('image', data.url('app/favicon.png'));
	btn.addEventListener('command', function(e) {
		emit(menu_btn, 'command', e);
	}, false);
	menu_btn	=	btn;

	var menupopup = document.createElement('menupopup');
	menupopup.setAttribute('id', 'tagit_menupopup');
	menu_drop	=	menupopup;

	var keys	=	Object.keys(menu_items);
	for(var i = 0, n = keys.length; i < n; i++)
	{
		var id		=	keys[i];
		var item	=	menu_items[id];
		var label	=	item.label;
		var clss	=	'menuitem-iconic';
		var image	=	item.image || false;
		var bold	=	item.bold || false;

		var menuitem	=	document.createElement('menuitem');
		menuitem.setAttribute('id', id);
		menuitem.setAttribute('label', label);
		menuitem.setAttribute('class', clss);
		if(image) menuitem.setAttribute('image', image);
		if(bold) menuitem.setAttribute('style', 'font-weight: bold !important;');
		menuitem.addEventListener('command', function(e) {
			emit(item, 'command', e);
		}, false);
		(function(item, id) {
			item.element	=	menuitem;
			item.activate	=	function() {
				if(menu_drop.contains(item.element)) menu_drop.removeChild(item.element);
				menu_drop.appendChild(item.element);
			};
		})(item, id);
		menupopup.appendChild(menuitem);
	}

	btn.appendChild(menupopup);

	// add button to toolbar palette
	var palette	=	document.getElementById('navigator-toolbox').palette;
	palette.appendChild(menu_btn);
	var nav		=	document.getElementById('nav-bar');

	is_init		=	true;
};

var install	=	function(is_install)
{
	var id		=	'tagit_button';
	var nav		=	document.getElementById('nav-bar');
	var set		=	nav.getAttribute('currentset').split(',');
	var idx		=	set.indexOf(id);
	if(idx < 0)
	{
		if(is_install)
		{
			nav.appendChild(menu_btn);
			nav.setAttribute('currentset', nav.currentSet);
			document.persist(nav.id, 'currentset');
		}
	}
	else
	{
		var before	=	null;
		for(var i = idx + 1; i < set.length; i++)
		{
			var tbid	=	set[i];
			before	=	document.getElementById(tbid);
			if(before) break;
		}

		if(before) nav.insertItem(id, before);
		else nav.insertItem(id);
	}
};

var uninstall	=	function()
{
	if(!menu_btn) return false;

	var palette	=	document.getElementById('navigator-toolbox').palette;
	if(palette.contains(menu_btn)) palette.removeChild(menu_btn);

	if(menu_btn.parentNode) menu_btn.parentNode.removeChild(menu_btn);
	menu_btn	=	null;

	var keys	=	Object.keys(menu_items);
	for(var i = 0, n = keys.length; i < n; i++)
	{
		var id			=	keys[i];
		var item		=	menu_items[id];
		item.element	=	false;
		item.activate	=	null;
	}

	is_init	=	false;
};

var clear_items		=	function()
{
	var items	=	Object.keys(menu_items);
	for(var i = 0, n = items.length; i < n; i++)
	{
		var id		=	items[i];
		var item	=	menu_items[id];
		var par		=	item.element.parentNode;
		if(par) par.removeChild(item.element);
	}
};

exports.init		=	init;
exports.install		=	install;
exports.uninstall	=	uninstall;
exports.clear_items	=	clear_items;
exports.btn			=	function() { return menu_btn; };
exports.items		=	function() { return menu_items; };

