var app	=	require("sdk/self");

exports.config = {
	// the full URL at which the API can be reached.
	api_url: 'https://api.turtl.it/api',

	// the URL of the addon website
	site_url: 'https://turtl.it',

	// make sure we get the extension version in the config
	version: app.version,

	// true to enable debugging. TURN OFF in production because it's a gaping
	// security hole
	debug: false
};
