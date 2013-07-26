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
	var form		=	document.getElement('form[name=login]');
	username.focus();
	form.addEvent('submit', function(e) {
		if(e) e.stop();
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
	var form	=	document.getElement('form[name=login]');
	if(!form) return false;
	form.removeEvents('submit');
});

addon.port.on('success', function() {
	loading(false);
	var username	=	document.getElement('input[name=username]');
	var password	=	document.getElement('input[name=password]');
	if(username) username.set('value', '');
	if(password) password.set('value', '');
});

addon.port.on('fail', function(status, err) {
	loading(false);
	note(err);
});
