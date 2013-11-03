window._in_ext	=	true;
var port		=	new FirefoxAddonPort(addon.port);
var barfr		=	null;
var _base_url	=	null;
var turtl		=	{db: null};

var loading	=	function(yesno)
{
	var yes	=	yesno ? true : false;
	var img	=	document.getElement('img.load');
	if(!img) return false;
	if(yes)	img.setStyle('visibility', 'visible');
	else	img.setStyle('visibility', '');
};

var note	=	function(txt)
{
	barfr.barf(txt);
};

var submit_login	=	function(e)
{
	if(e) e.stop();
	var form	=	e.target;

	var username	=	form.getElement('input[name=username]');
	var password	=	form.getElement('input[name=password]');
	var user	=	new User({
		username: username.get('value'),
		password: password.get('value')
	});
	var auth	=	user.get_auth();
	var key		=	tcrypt.key_to_string(user.get_key());
	if(!auth) return;
	loading(true);
	user.test_auth({
		success: function(id) {
			loading(false);
			addon.port.emit('login-success', id, auth, key);
			var username	=	document.getElement('.login input[name=username]');
			var password	=	document.getElement('.login input[name=password]');
			if(username) username.set('value', '');
			if(password) password.set('value', '');
		},
		error: function(err) {
			loading(false);
			note(err);
		}
	});
};

var submit_join	=	function(e)
{
	if(e) e.stop();
	var form	=	e.target;

	var username	=	form.getElement('input[name=username]');
	var password	=	form.getElement('input[name=password]');
	var pconfirm	=	form.getElement('input[name=confirm]');
	var submit		=	form.getElement('input[type=submit]');

	// error check
	if(password.get('value') != pconfirm.get('value'))
	{
		note('Your password does not match the confirmation.');
		pconfirm.focus();
		return false;
	}
	if(password.get('value').length < 4)
	{
		note('Your password must have four or more characters.');
		password.focus();
		return false;
	}
	if(password.get('value').toLowerCase() == 'password')
	{
		note('No. Bad user. BAD. That is <em>not</em> an acceptable password.');
		password.focus();
		return false;
	}

	submit.disabled	=	true;

	var user	=	new User({
		username: username.get('value'),
		password: password.get('value')
	});
	var auth	=	user.get_auth();
	var key		=	tcrypt.key_to_string(user.get_key());
	if(!auth) return;

	loading(true);
	user.join({
		success: function(userdata) {
			loading(false);
			// manually set up our local db
			database.setup({complete: function(server) { turtl.db = server; }});

			// log the user in (runs some important events, including finishing
			// adding our user to the local db)
			var data = user.toJSON();
			data.id = userdata.id;
			turtl.user.set({
				username: user.get('username'),
				password: user.get('password')
			});
			turtl.user.login(data);

			addon.port.emit('join-success', userdata.id, auth, key);
			var username	=	document.getElement('.join input[name=username]');
			var password	=	document.getElement('.join input[name=password]');
			var pconfirm	=	document.getElement('.join input[name=confirm]');
			if(username) username.set('value', '');
			if(password) password.set('value', '');
			if(pconfirm) pconfirm.set('value', '');
		},
		error: function(err) {
			loading(false);
			submit.disabled	=	false;
			note(err);
		}
	});
};

window.addEvent('domready', function() {
	barfr	=	new Barfr('barfr', {});

	var container	=	document.getElement('.user-panel');
	container.addEvent('submit:relay(.login form)', submit_login);
	container.addEvent('submit:relay(.join form)', submit_join);

	turtl.api				=	new Api(
		'',
		'',
		function(cb_success, cb_fail) {
			return function(data)
			{
				if(typeof(data) == 'string')
				{
					data	=	JSON.decode(data);
				}
				if(data.__error) cb_fail(data.__error);
				else cb_success(data);
			};
		}
	);
});

addon.port.on('show', function() {
	var login_username	=	document.getElement('.login input[name=username]');
	if(login_username) login_username.focus();
});

addon.port.on('init', function(base) {
	_base_url	=	base;
});

// hey ding-dong, we're done here
addon.port.emit('loaded');

