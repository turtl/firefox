/**
 * Handles creation/distribution of RSA keys. Note that it hijacks another panel
 * instead of creating its own for purposes of efficiency. This panel/worker/etc
 * that it gets passed *must* have the data/rsa.js file loaded and also all the
 * tcrypt/cowcrypt libs loaded as well.
 */

var data			=	require('sdk/self').data;
var simple			=	require('sdk/simple-storage');
var notifications	=	require('sdk/notifications');
var { on, once, off, emit }	=	require('sdk/event/core');

var config			=	require('config').config;

var panel_port		=	false;
var port			=	{};
var rsa_keys		=	[];
var generating_key	=	false;
var notify_on_gen	=	false;

/**
 * Generate a new key
 */
var new_key	=	function()
{
	if(!panel_port) return false;
	console.log('RSA: gen key');
	generating_key	=	true;
	panel_port.emit('generate-rsa-keypair');
	emit(port, 'gen-key');
};

/**
 * Set the keys array. If empty, generate a new key
 */
var set_keys	=	function(keys)
{
	rsa_keys				=	keys;
	simple.storage.rsa_keys	=	rsa_keys;

	// always make sure we have a key
	/*
	if(rsa_keys.length == 0)
	{
		new_key();
	}
	*/
};

/**
 * Add a new key to our list.
 */
var push_key	=	function(key)
{
	console.log('RSA: pushing key');
	generating_key	=	false;
	var keys	=	rsa_keys;
	keys.push(key);
	set_keys(keys);
	emit(port, 'new-key');
	if(notify_on_gen)
	{
		notifications.notify({
			title: 'RSA key generation complete',
			text: 'You can now share with others!',
			data: '',
			iconURL: data.url('app/favicon.128.png'),
			onClick: function(data) {
			}
		});
	}
};

/**
 * Takes the data handler and the port of a panel/worker/whatever that has the
 * tcrypt/RSA libs ready to go.
 */
var init	=	function(_panel_port)
{
	if(panel_port) return false;
	panel_port		=	_panel_port;

	// listen for RSA keygen event, and store the key if we get one
	panel_port.on('rsa-keypair', function(rsakey) {
		// push the new key into the data handler so others can use it
		push_key(rsakey);
	});

	// catch any errors
	panel_port.on('rsa-keygen-error', function(err) {
		console.log('RSA: error: ', err);
	});

	// move keys from simple storage into data handler. if keys.length == 0
	// then we generate a new keypair and save it
	simple.storage.rsa_keys || (simple.storage.rsa_keys = []);
	set_keys(simple.storage.rsa_keys);
};

/**
 * Grab a key off the key list. If this empties the list, an event is triggered
 * to generate a new one.
 */
var pop_key	=	function()
{
	if(!panel_port) return false;

	var keys	=	rsa_keys;
	if(keys.length == 0) return false;

	// pop the first key off the array, save the (keys - popped) array back into
	// the keys array. note that if rsa_keys array is empty when we call
	// set_keys, a new key will be generated (so we always have one)
	var key	=	keys.shift();
	set_keys(keys);

	emit(port, 'pop-key');
	console.log('RSA: pop key');

	return key;
};

var destroy	=	function()
{
	if(!panel_port) return false;
};

exports.init			=	init;
exports.port			=	port;
exports.new_key			=	new_key;
exports.pop_key			=	pop_key;
exports.destroy			=	destroy;
exports.generating_key	=	function() { return generating_key; };
exports.notify_on_gen	=	function(on) { notify_on_gen = on; };

