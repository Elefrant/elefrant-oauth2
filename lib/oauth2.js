'use strict';

var oauthserver = require('oauth2-server-restify'),
		models = require('./models'),
		configDefault = require('../config/oauth2');

module.exports = function (elefrant, server, name) {
	var config = configDefault;
	if (elefrant && elefrant.getConfigComp) {
		config = elefrant.getConfigComp(name, configDefault);
	}

	// Create oauth server
	server.oauth = oauthserver({
		model: models(elefrant),
		grants: config.grants,
		debug: elefrant.config.system.debug || true
	});

	server.use(server.oauth.checkAuthorise('oauth'));
};