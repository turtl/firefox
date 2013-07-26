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
	var note	=	document.getElement('span.note');
	if(!note) return false;
	note.set('html', txt);
};

addon.port.on('show', function() {
	var username	=	document.getElement('input[name=username]');
	var password	=	document.getElement('input[name=password]');
	var pconfirm	=	document.getElement('input[name=confirm]');
	var submit		=	document.getElement('input[type=submit]');
	var form		=	document.getElement('form[name=join]');
	username.focus();
	form.addEvent('submit', function(e) {
		if(e) e.stop();

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
		note('');
		loading(true);
		addon.port.emit('submit', auth, key);
	});
});

addon.port.on('hide', function() {
	var form	=	document.getElement('form[name=join]');
	if(!form) return false;
	form.removeEvents('submit');
});

addon.port.on('success', function() {
	loading(false);
	var username	=	document.getElement('input[name=username]');
	var password	=	document.getElement('input[name=password]');
	var pconfirm	=	document.getElement('input[name=confirm]');
	if(username) username.set('value', '');
	if(password) password.set('value', '');
	if(pconfirm) pconfirm.set('value', '');
});

addon.port.on('fail', function(status, err) {
	loading(false);
	note(err);
	this.submit.disabled	=	false;
});
