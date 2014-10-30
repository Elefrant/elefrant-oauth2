'use strict';

var oauthserver = require('oauth2-server-restify'),
		models = require('./models'),
		configDefault = require('../config/oauth2');

module.exports = function (elefrant, server, name) {
	var config = configDefault,
			debug = true;
	if (elefrant && elefrant.getConfigComp) {
		config = elefrant.getConfigComp(name, configDefault);
		debug = elefrant.config.system.debug;
	}

	// Create oauth server
	server.oauth = oauthserver({
		model: models(elefrant),
		grants: config.grants,
		debug: debug
	});

	server.use(server.oauth.checkAuthorise('oauth'));

	return true;
};