addon.port.on('generate-rsa-keypair', function() {
	tcrypt.generate_rsa_keypair({
		success: function(rsakey) {
			addon.port.emit('rsa-keypair', tcrypt.rsa_key_to_json(rsakey));
		},
		error: function(err) {
			addon.port.emit('rsa-keygen-error', err);
		}
	});
});


