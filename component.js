'use strict';

var oauth2 = require('./lib/oauth2.js'),
		routes = require('./routes/oauth2'),
		name = 'oauth2';

module.exports = {
	enable: true,

	name: name,

	afterServer: function (elefrant, server) {
		return oauth2(elefrant, server, 'oauth2');
	},

	beforeRoute: function (elefrant, server, restify) {
		return routes(elefrant, server, 'oauth', restify);
	},

	paramRoute: function (elefrant, route) {
		if(route) {
			return {
				// oauth param in route -> oatuh: ['readWrite', 'admin']
				oauth: route.oauth !== undefined ? route.oauth : false
			};
		} else {
			return {};
		}
	}
};
