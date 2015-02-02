'use strict';

var redis = require('redis');

module.exports = function(elefrant) {
	if(!elefrant || !elefrant.resolve) return {};

	var keyUsername = elefrant.config.oauth.keyUsername || 'username',
		keyPassword = elefrant.config.oauth.keyPassword || 'password',
		keyClientId = elefrant.config.oauth.keyClientId || 'id',
		keyClientSecret = elefrant.config.oauth.keyClientSecret || 'secret',
		keyAccessToken = elefrant.config.oauth.keyAccessToken || 'accessToken',
		keyAccessTokenClient = elefrant.config.oauth.keyAccessTokenClient || 'client',
		keyAccessTokenUser = elefrant.config.oauth.keyAccessTokenUser || 'user',
		keyAccessTokenExpires = elefrant.config.oauth.keyAccessTokenExpires || 'expires',
		keyAccessTokenType =  elefrant.config.oauth.keyAccessTokenType || 'password',
		keyRefreshToken = elefrant.config.oauth.keyRefreshToken || 'refreshToken';

	var redisClient = new redis.createClient(elefrant.config.oauth.connection.port, elefrant.config.oauth.connection.host, elefrant.config.oauth.connection);

	if (elefrant.config.oauth.connection.pass && elefrant.config.oauth.connection.pass.length > 0) {
		redisClient.auth(elefrant.config.oauth.connection.pass, function(err) {
			if (err) {
				throw err;
			}
		});
	}

	if (elefrant.config.oauth.connection.db) {
		redisClient.select(elefrant.config.oauth.connection.db);
		redisClient.on('connect', function() {
			redisClient.send_anyways = true;
			redisClient.select(elefrant.config.oauth.connection.db);
			redisClient.send_anyways = false;
		});
	}

	// handle events
	redisClient.on('error', function (err) {
		elefrant.log('error', 'Redis database: ' + err);
	});
	redisClient.on('connect', function () {
		elefrant.log('info', 'Oauth: Connected to Redis database');
	});

	return elefrant.resolve(function(User, Client, Accesstoken, Refreshtoken) {
		return {
			getAccessToken: function (bearerToken, callback) {
				elefrant.log('debug', 'In getAccessToken (bearerToken: ' + bearerToken + ')');

				var criteria = {};
				criteria[keyAccessToken] = bearerToken;
				Accesstoken.findOne(criteria, callback);
			},

			getClient: function (clientId, clientSecret, callback) {
				elefrant.log('debug', 'In getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');

				if (clientSecret === null) {
					return Client.findOne({
						id: clientId
					}, callback);
				}

				var criteria = {};
				criteria[keyClientId] = clientId;
				criteria[keyClientSecret] = clientSecret;
				Client.findOne(criteria, callback);
			},

			/*
			 * This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
			 * it gives an example of how to use the method to restrict certain grant types
			 */
			grantTypeAllowed: function (clientId, grantType, callback) {
				elefrant.log('debug', 'In grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

				if (grantType === 'password') {
					var criteria = {};
					criteria[keyClientId] = clientId;
					Client.findOne(criteria)
						.exec(function(err, client) {
							if (err || !client) {
								callback(false, false);
							} else {
								callback(false, true);
							}
						});
				} else {
					callback(false, true);
				}
			},

			saveAccessToken: function (token, clientId, expires, userId, callback) {
				elefrant.log('debug', 'In saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

				var criteria = {},
					searchCriteria = {};
				criteria[keyAccessToken] = token;
				criteria[keyAccessTokenClient] = clientId;
				criteria[keyAccessTokenUser] = userId;
				criteria[keyAccessTokenExpires] = expires;
				searchCriteria[keyAccessTokenClient] = clientId;
				searchCriteria[keyAccessTokenUser] = userId;
				Accesstoken.create(criteria)
					.exec(callback);
			},

			/*
			 * Required to support password grant type
			 */
			getUser: function (username, password, callback) {
				elefrant.log('debug', 'In getUser (username: ' + username + ', password: ' + password + ')');

				var criteria = {};
				criteria[keyUsername] = username;
				criteria[keyPassword] = password;
				User.findOnePassword(criteria, function(err, user) {
					if (err) {
						callback(err);
					} else if (!user) {
						callback(null, null);
					} else {
						callback(null, user.id);
					}
				});
			},

			/*
			 * Required to support authorization_code grant type
			 */
			getUserFromClient: function (clientId, clientSecret, callback) {
				elefrant.log('debug', 'In getUserFromClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');

				var criteria = {};
				criteria[keyClientId] = clientId;

				if (clientSecret === null) {
					return Client.findOne(criteria, callback);
				}

				criteria[keyClientSecret] = clientSecret;
				Client.findOne(criteria, callback);
			},

			/*
			 * Required to support authorization_code grant type
			 */
			getAuthCode: function (authCode, callback) {

			},

			saveAuthCode: function (authCode, clientId, expires, userId, callback) {
				elefrant.log('debug', 'In saveAuthCode (authCode: ' + authCode + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

				var criteria = {},
					searchCriteria = {};
				criteria[keyAccessToken] = authCode;
				criteria[keyAccessTokenClient] = clientId;
				criteria[keyAccessTokenUser] = userId;
				criteria[keyAccessTokenExpires] = expires;
				criteria[keyAccessTokenType] = 'code';
				searchCriteria[keyAccessTokenClient] = clientId;
				searchCriteria[keyAccessTokenUser] = userId;
				Accesstoken.create(criteria)
					.exec(callback);
			},

			/*
			 * Required to support refreshToken grant type
			 */
			saveRefreshToken: function (token, clientId, expires, userId, callback) {
				elefrant.log('debug', 'In saveRefreshToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

				var criteria = {};
				criteria[keyRefreshToken] = token;
				criteria[keyAccessTokenClient] = clientId;
				criteria[keyAccessTokenUser] = userId;
				criteria[keyAccessTokenExpires] = expires;
				Refreshtoken.create(criteria)
					.exec(callback);
			},

			getRefreshToken: function (refreshToken, callback) {
				elefrant.log('debug', 'In getRefreshToken (refreshToken: ' + refreshToken + ')');

				var criteria = {};
				criteria[keyRefreshToken] = refreshToken;
				Refreshtoken.findOne(criteria, callback);
			},

			revokeRefreshToken: function (refreshToken, callback) {

			},

			getSession: function (user_id, callback) {
				redisClient.get('oauth:session:' + user_id, function(err, status) {
					if(err || !status) {
						callback(err, status);
					} else {
						callback(null, JSON.parse(status));
					}
				});
			},

			destroySession: function (user_id, callback) {
				redisClient.exists('oauth:session:' + user_id, function(err, status) {
					if(status === 1) {
						redisClient.del('oauth:session:' + user_id, callback);
					} else {
						callback(err, status);
					}
				});
			},

			saveSession: function (user_id, data, callback) {
				var self = this;
				redisClient.exists('oauth:session:' + user_id, function(err, status) {
					if(err) {
						callback(err);
					} else if(status === 1) {
						self.getSession(user_id, callback);
					} else {
						if(elefrant.config.oauth.authoriseLifetime) {
							redisClient.setex('oauth:session:' + user_id, elefrant.config.oauth.authoriseLifetime, JSON.stringify(data), callback);
						} else {
							redisClient.set('oauth:session:' + user_id, JSON.stringify(data), callback);
						}
					}
				});
			}
		};
	});


};
