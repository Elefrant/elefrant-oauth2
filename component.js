'use strict';

var oauth2 = require('./lib/oauth2.js'),
		routes = require('./routes/oauth2'),
		name = 'oauth2';

module.exports = {
	enable: true,

	name: name,

	afterServer: function (elefrant, server) {
		oauth2(elefrant, server, name);
	},

	beforeRoute: function (elefrant, server) {
		routes(server);
	},

	paramRoute: function (elefrant, route) {
		return {
			oauth: route.oauth !== undefined ? route.oauth : true
		};
	}
};
