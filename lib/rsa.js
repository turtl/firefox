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
var generating_key	=	false;
var notify_on_gen	=	false;

/**
 * Add a new key to our list.
 */
var notify	=	function(key)
{
	if(notify_on_gen)
	{
		notifications.notify({
			title: 'RSA key generation complete',
			text: 'You can now share with others!',
			data: '',
			iconURL: data.url('app/images/favicon.128.png'),
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
	if(!_panel_port) return false;

	panel_port		=	_panel_port;

	panel_port.on('rsa-keygen-start', function() {
		console.log('RSA: gen');
		emit(port, 'gen-key');
		generating_key	=	true;
	});
	panel_port.on('rsa-keygen-finish', function() {
		console.log('RSA: finish');
		emit(port, 'new-key');
		notify();
		generating_key	=	false;
	});
	panel_port.on('rsa-keygen-error', function(err) {
		console.log('RSA: error');
		emit(port, 'new-key');
		console.log('RSA: error: ', err);
		generating_key	=	false;
	});
};

var destroy	=	function()
{
	if(!panel_port) return false;
	panel_port.off('rsa-keygen-start');
	panel_port.off('rsa-keygen-finish');
	panel_port.off('rsa-keygen-error');
};

exports.init			=	init;
exports.port			=	port;
exports.destroy			=	destroy;
exports.generating_key	=	function() { return generating_key; };
exports.notify_on_gen	=	function(on) { notify_on_gen = on; };

