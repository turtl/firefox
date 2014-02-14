var app	=	require("sdk/self");

exports.config = {
	// the full URL at which the API can be reached.
	api_url: 'http://turtl.dev:8181/api',

	// the URL of the addon website
	site_url: 'turtl.dev:8182',

	// make sure we get the extension version in the config
	version: app.version,

	// true to enable debugging. TURN OFF in production because it's a gaping
	// security hole
	debug: true
};
