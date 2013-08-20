var InvitesController	=	Composer.Controller.extend({
	tag: 'ul',

	elements: {
	},

	events: {
		'click a[href=#accept]': 'accept_invite',
		'click a[href=#unlock]': 'unlock_invite',
		'click a[href=#deny]': 'deny_invite',
		'submit form.secret': 'do_unlock_invite'
	},

	collection: null,

	init: function()
	{
		if(!this.collection) return false;
		this.collection.bind(['add', 'remove', 'reset', 'change'], this.render.bind(this), 'invites:collection:all');
	},

	release: function()
	{
		this.collection.unbind(['add', 'remove', 'reset', 'change'], 'invites:collection:all');
		this.parent.apply(this, arguments);
	},

	render: function()
	{
		var content			=	'';
		if(this.collection.models().length > 0)
		{
			var invites_data	=	this.collection.toJSON();
			invites_data.each(function(inv) {
				content	+=	'<li class="invite_'+inv.id+' clear">';
				content	+=	'<div class="actions">';
				if(inv.data.used_secret)
				{
					content	+=	'<a href="#unlock" title="Unlock invite"><img src="app/images/site/icons/lock_16x16_blank.png" width="16" height="16" alt="Unlock"></a>';
				}
				else
				{
					content	+=	'<a href="#accept" title="Accept invite"><img src="app/images/site/icons/check_16x16.png" width="16" height="16" alt="Accept"></a>';
				}
				content	+=	'<a href="#deny" title="Deny invite"><img src="app/images/site/icons/x_16x16.png" width="16" height="16" alt="Deny"></a>';
				content	+=	'</div>';
				content	+=	(inv.type != 'b' ? 'Other' : 'Board') + ' invite ';
				content	+=	'<strong>'+inv.code+'</strong>';
				if(inv.data.used_secret)
				{
					content	+=	'&nbsp;&nbsp;(locked invite, <a href="#unlock">enter secret to unlock</a>)';
					content	+=	'<form class="secret">';
					content	+=	'<input type="text" name="secret" placeholder="Enter this invite\'s shared secret to unlock and accept">';
					content	+=	'<input type="submit" value="Unlock">';
					content	+=	'</form>';
				}
				content	+=	'</li>';
			});
		}
		else
		{
			content	+=	'<li class="none">You have no pending invites.</li>';
		}
		this.html(content);
	},

	get_invite_id_from_el: function(el)
	{
		// grab first <li> tag (holds our id val);
		var tmpel	=	el;
		var li		=	null;
		for(var i = 0, n = 10; i < n; i++)
		{
			if(tmpel.get('tag').toLowerCase() == 'li')
			{
				li	=	tmpel;
				break;
			}
			tmpel	=	tmpel.getParent();
		}

		if(!li) return false;

		return li.className.replace(/^.*invite_([0-9a-f-]+).*?$/, '$1');
	},

	key_valid: function(key)
	{
		return key.match(/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/);
	},

	accept_invite: function(e)
	{
		if(!e) return;
		e.stop();

		var invite_id	=	this.get_invite_id_from_el(e.target);
		var invite		=	this.collection.find_by_id(invite_id);
		if(!invite) return;

		var board_key	=	invite.decrypt_key(invite.get('data').board_key, invite.get('data').key, '');
		if(!board_key || !this.key_valid(board_key)) return false;

		addon.port.emit('accept', invite_id, board_key);
	},

	deny_invite: function(e)
	{
		if(!e) return;
		e.stop();

		var invite_id	=	this.get_invite_id_from_el(e.target);
		var invite		=	this.collection.find_by_id(invite_id);
		if(!invite) return;
		addon.port.emit('deny', invite_id);
	},

	unlock_invite: function(e)
	{
		if(!e) return;
		e.stop();

		var invite_id	=	this.get_invite_id_from_el(e.target);
		this.el.getElement('li.invite_'+invite_id+' form').setStyle('display', 'block');
		this.el.getElement('li.invite_'+invite_id+' input[name=secret]').focus();
	},

	do_unlock_invite: function(e)
	{
		if(!e) return;
		e.stop();

		var secret	=	e.target.getElement('input[name=secret]').get('value');
		secret		=	secret.clean();
		if(secret == '') return false;

		var invite_id	=	this.get_invite_id_from_el(e.target);
		var invite		=	this.collection.find_by_id(invite_id);
		if(!invite) return false;

		var board_key	=	invite.decrypt_key(invite.get('data').board_key, invite.get('data').key, secret);
		if(!board_key || !this.key_valid(board_key)) return false;

		addon.port.emit('accept', invite_id, board_key);
	}
});

var invites				=	null;
var invites_controller	=	null;
var loaded				=	false;
var load_actions		=	[];
window.addEvent('domready', function() {
	invites				=	new Invites();
	invites_controller	=	new InvitesController({
		inject: 'div.invites',
		collection: invites
	});
	loaded	=	true;
	load_actions.each(function(fn) { fn(); });
});

addon.port.on('populate-invites', function(invite_data) {
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

