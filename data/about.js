window.addEvent('domready', function() {
	$(document.body).addEvent('click:relay(a)', function(e) {
		if(e) e.stop();
		addon.port.emit('clicked', e.target.href);
	});
});
