exports.config = {
	// the full URL at which the API can be reached.
	api_url: 'http://127.0.0.1:81/api',

	// the URL of the addon website
	site_url: 'http://tagit.beeets.com',

	// settings for bookmarker
	bookmark: {
		// if true, bookmarker loads once on init and lives for the duration of
		// the browser session.
		// if false, bookmarker is full reloaded/destroyed on open/close each
		// time.
		persist: true
	},

	// settings for sync process
	sync: {
	}
};
