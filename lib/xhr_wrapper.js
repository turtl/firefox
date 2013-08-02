var request	=	require('sdk/request').Request;
var config	=	require('config').config;

/**
 * Given a port (event) object, tie into it such that it can send/recv XHR data
 * using message-passing.
 */
var wrap	=	function(port, options)
{
	options || (options = {});

	// monitor the port for XHR requests from the app. we take any
	// applicable data, do our own request here, then send back any
	// response data via an event the app listens for.
	//
	// this allows the app to make XHR requests as if it's talking to a
	// local server even when it would otherwise be impossible (due to
	// XSS limitations of loading the app in a tab).
	port.on('xhr', function(args) {
		var id		=	args.id;
		var method	=	args.method;
		var url		=	config.api_url + args.url;
		if(options.log) console.log('req('+id+'): ', method, args.url);
		var req_options	=	{
			url: url,
			headers: args.headers,
			content: args.data,
			onComplete: function(result) {
				if(options.log) console.log('res('+id+'): ', result.status);
				// got response, send it back into the app
				port.emit('xhr-response', id, {
					status: result.status,
					text: result.text,
					statusText: result.statusText,
					headers: result.headers
				});
			}
		};
		var req	=	request(req_options);
		if(method.toLowerCase() == 'get')
		{
			req.get();
		}
		else
		{
			req.post();
		}
	});
};

exports.wrap	=	wrap;
