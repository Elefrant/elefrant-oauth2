'use strict';

var configDefault = require('../config/oauth'),
    models = require('../lib/models'),
    filed = require('filed'),
    mime = require('mime');

module.exports = function (elefrant, server, name) {
    var config = configDefault;
    if (elefrant && elefrant.getConfigComp) {
        config = elefrant.getConfigComp(name, configDefault);
        elefrant.config.oauth = config;
    }

    elefrant.resolve(function(User) {

        var model = models(elefrant);

        server.post('/oauth/token', server.oauth.grant());

        server.get('/oauth/authorise', function (req, res, next) {
            model.getSession(req.query.id, function(err, user){
                if(err || !user) {
                    return res.redirect('/login?' + (req.body.redirect ? 'redirect=' + req.body.redirect + '&' : '') + 'client_id=' +
                    req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
                } else {
                    res.render(config.authoriseTemplate, {
                        name: user.name,
                        id: user.id,
                        redirect: req.query.redirect,
                        client_id: req.query.client_id,
                        redirect_uri: req.query.redirect_uri
                    });
                }

                next();
            });
        });

        server.get('/oauth/authorise/cancel', function (req, res, next) {
            model.destroySession(req.query.id, function(err, user){
                return res.redirect(req.query.redirect_uri + '?status=cancel');

                next();
            });
        });

        // Handle authorise
        server.post('/oauth/authorise', function (req, res, next) {
            model.getSession(req.query.id, function(err, user){
                if(err || !user) {
                    return res.redirect('/login?' + (req.body.redirect ? 'redirect=' + req.body.redirect + '&' : '') + 'client_id=' +
                    req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
                }

                req.session = req.session || {};
                req.session.user = user;
                req.body.response_type = 'code';

                next();
            });
        }, server.oauth.authCodeGrant(function (req, next) {
            // The first param should to indicate an error
            // The second param should a bool to indicate if the user did authorise the app
            // The third param should for the user/uid (only used for passing to saveAuthCode)
            next(null, req.body.allow === 'yes', req.session.user.id, req.session.user);
        }));

        // Show login
        server.get('/login', function (req, res, next) {
            res.render(config.loginTemplate, {
                apiName: elefrant.name,
                redirect: req.query.redirect,
                client_id: req.query.client_id,
                redirect_uri: req.query.redirect_uri
            });

            next();
        });

        // Handle login
        server.post('/login', function (req, res, next) {
            if(!req.body.username || !req.body.password) {
                return res.redirect('/login?' + (req.body.redirect ? 'redirect=' + req.body.redirect + '&' : '') + 'client_id=' +
                req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);

                next();
            }

            var criteria = {};
            criteria[config.keyUsername] = req.body.username;
            criteria[config.keyPassword] = req.body.password;

            User.findOnePassword(criteria, function(err, user) {
                if(err || !user)  {
                    return res.redirect('/login?' + (req.body.redirect ? 'redirect=' + req.body.redirect + '&' : '') + 'client_id=' +
                    req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
                } else {
                    // Successful logins should send the user back to the /oauth/authorise
                    // with the client_id and redirect_uri (you could store these in the session)
                    model.saveSession(user.id, user, function(err, status){
                        return res.redirect((req.body.redirect || '/oauth/authorise') + '?client_id=' +
                        req.body.client_id + '&redirect_uri=' + req.body.redirect_uri + '&id=' + user.id);
                    });
                }

                next();
            });
        });


        // Middleware
        server.use(function (req, res, next) {
            var scopes = req.route ? req.route.oauth : undefined;

            if(scopes) {
                return next(server.oauth.authorise());
            }

            next();
        });

    });
};
