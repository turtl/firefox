// TODO: https://developer.mozilla.org/en-US/docs/XUL/School_tutorial/Adding_Toolbars_and_Toolbar_Buttons?redirectlocale=en-US&redirectslug=XUL_School%2FAdding_Toolbars_and_Toolbar_Buttons#Adding_toolbar_buttons_to_existing_toolbars
//       (make toolbar button active on first time run)
var win_utils	=	require("window-utils");
var data		=	require('sdk/self').data;
var { on, once, off, emit }	=	require('sdk/event/core');

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

var delegate = {
	onTrack: function(window) {
		if(window.location != "chrome://browser/content/browser.xul") {
			// console.log("=> win location false");
			return;
		}

		//console.log("window tracked");

		var document = window.document;
		var navBar = document.getElementById('nav-bar');

		var btn = document.createElement('toolbarbutton');  
		btn.setAttribute('id', 'tagit_button'); 
		btn.setAttribute('type', 'menu-button');  
		btn.setAttribute('class', 'toolbarbutton-1'); 
		btn.setAttribute('image', data.url('app/favicon.png'));
		btn.addEventListener('command', function(e) {
			emit(menu_btn, 'command', e);
		}, false);
		menu_btn	=	btn;

		var menupopup = document.createElement('menupopup');
		menupopup.setAttribute('id', 'menupopup');
		menupopup.setAttribute('disabled', 'disabled');
		menupopup.addEventListener('popupshown', function(e) {
			emit(menu_drop, 'open', e);
		}, false);
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
					menupopup.appendChild(item.element);
				};
			})(item, id);
			menupopup.appendChild(menuitem);
		}

		btn.appendChild(menupopup);
		navBar.appendChild(btn);
	}
};
win_utils.WindowTracker(delegate);

exports.btn			=	menu_btn;
exports.dropdown	=	menu_drop;
exports.items		=	menu_items;
exports.clear_items	=	function()
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

