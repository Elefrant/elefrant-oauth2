'use strict';

module.exports = function(elefrant) {
	if(!elefrant || !elefrant.resolve) return {};

	return elefrant.resolve(function(User, Client, Accesstoken, Refreshtoken) {
		return {
			getAccessToken: function (bearerToken, callback) {
				elefrant.log('debug', 'In getAccessToken (bearerToken: ' + bearerToken + ')');

				Accesstoken.findOne({
					accessToken: bearerToken
				}, callback);
			},

			getClient: function (clientId, clientSecret, callback) {
				elefrant.log('debug', 'In getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');

				if (clientSecret === null) {
					return Client.findOne({
						clientId: clientId
					}, callback);
				}
				Client.findOne({
					clientId: clientId,
					clientSecret: clientSecret
				}, callback);
			},

			/*
			 * This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
			 * it gives an example of how to use the method to restrict certain grant types
			 */
			grantTypeAllowed: function (clientId, grantType, callback) {
				elefrant.log('debug', 'In grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

				if (grantType === 'password') {
					Client.findOne({
						clientId: clientId
					})
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

				Accesstoken.create({
					accessToken: token,
					clientId: clientId,
					userId: userId,
					expires: expires
				})
						.exec(callback);
			},

			/*
			 * Required to support password grant type
			 */
			getUser: function (username, password, callback) {
				elefrant.log('debug', 'In getUser (username: ' + username + ', password: ' + password + ')');

				User.findOne({
					username: username,
					password: password
				})
						.exec(function(err, user) {
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

				if (clientSecret === null) {
					return Client.findOne({
						clientId: clientId
					}, callback);
				}
				Client.findOne({
					clientId: clientId,
					clientSecret: clientSecret
				}, callback);
			},

			/*
			 * Required to support authorization_code grant type
			 */
			getAuthCode: function (authCode, callback) {

			},

			saveAuthCode: function (authCode, clientId, expires, user, callback) {

			},


			/*
			 * Required to support refreshToken grant type
			 */
			saveRefreshToken: function (token, clientId, expires, userId, callback) {
				elefrant.log('debug', 'In saveRefreshToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

				Refreshtoken.create({
					refreshToken: token,
					clientId: clientId,
					userId: userId,
					expires: expires
				})
						.exec(callback);
			},

			getRefreshToken: function (refreshToken, callback) {
				elefrant.log('debug', 'In getRefreshToken (refreshToken: ' + refreshToken + ')');

				Refreshtoken.findOne({
					refreshToken: refreshToken
				}, callback);
			},

			revokeRefreshToken: function (refreshToken, callback) {

			}
		};
	});


};
