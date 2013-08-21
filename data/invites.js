var port	=	new FirefoxAddonPort(addon.port);

var invites				=	null;
var invites_controller	=	null;
var loaded				=	false;
var load_actions		=	[];

var _base_url			=	null;

window.addEvent('domready', function() {
	// make sure inline templates are loaded
	Template.initialize();

	invites				=	new Invites();
	invites_controller	=	new InvitesListController({
		inject: 'div.invites',
		collection: invites
	});
	loaded	=	true;
	load_actions.each(function(fn) { fn(); });
});

addon.port.on('populate-invites', function(invite_data, base_url) {
	_base_url	=	base_url;
	// convert invites object into an array
	var invites_arr	=	[];
	Object.keys(invite_data).each(function(key) {
		invites_arr.push(invite_data[key]);
	});

	var do_update	=	function() { invites.reset(invites_arr); };

	// in case this gets called before DOMready
	if(!loaded) load_actions.push(do_update);
	else do_update();
});

