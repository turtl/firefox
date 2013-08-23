var barfr		=	null;
var _base_url	=	null;

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
	addon.port.emit('login-submit', auth, key);
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
	addon.port.emit('join-submit', auth, key);
};

window.addEvent('domready', function() {
	barfr	=	new Barfr('barfr', {});

	var container	=	document.getElement('.user-panel');
	container.addEvent('submit:relay(.login form)', submit_login);
	container.addEvent('submit:relay(.join form)', submit_join);
});

addon.port.on('show', function() {
	var login_username	=	document.getElement('.login input[name=username]');
	if(login_username) login_username.focus();
});

addon.port.on('login-success', function() {
	loading(false);
	var username	=	document.getElement('.login input[name=username]');
	var password	=	document.getElement('.login input[name=password]');
	if(username) username.set('value', '');
	if(password) password.set('value', '');
});

addon.port.on('login-fail', function(status, err) {
	loading(false);
	note(err);
});

addon.port.on('join-success', function() {
	loading(false);
	var username	=	document.getElement('.join input[name=username]');
	var password	=	document.getElement('.join input[name=password]');
	var pconfirm	=	document.getElement('.join input[name=confirm]');
	if(username) username.set('value', '');
	if(password) password.set('value', '');
	if(pconfirm) pconfirm.set('value', '');
});

addon.port.on('join-fail', function(status, err) {
	loading(false);
	note(err);
	this.submit.disabled	=	false;
});

addon.port.on('init', function(base) {
	_base_url	=	base;
});

// hey ding-dong, we're done here
addon.port.emit('loaded');

