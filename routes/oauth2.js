'use strict';

var configDefault = require('../config/oauth2'),
    models = require('../lib/models'),
    filed = require('filed'),
    mime = require('mime');

module.exports = function (elefrant, server, name, restify) {
    var config = configDefault;
    if (elefrant && elefrant.getConfigComp) {
        config = elefrant.getConfigComp(name, configDefault);
    }

    var model = models(elefrant);

    server.post('/oauth/token', server.oauth.grant());

    server.get('/oauth/authorise', function (req, res, next) {
        if (!req.session.user) {
            // If they aren't logged in, send them to your own login implementation
            return res.redirect('/login?redirect=' + req.getPath() + '&client_id=' +
            req.query.client_id + '&redirect_uri=' + req.query.redirect_uri);
        }

        res.render(config.authoriseTemplate, {
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri
        });

        next();
    });

    // Handle authorise
    server.post('/oauth/authorise', function (req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login?client_id=' + req.query.client_id +
            '&redirect_uri=' + req.query.redirect_uri);
        }

        next();
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
        // Insert your own login mechanism
        if (req.body.email !== 'thom@nightworld.com') {
            res.render('login', {
                redirect: req.body.redirect,
                client_id: req.body.client_id,
                redirect_uri: req.body.redirect_uri
            });

            next();
        } else {
            // Successful logins should send the user back to the /oauth/authorise
            // with the client_id and redirect_uri (you could store these in the session)
            return res.redirect((req.body.redirect || '/home') + '?client_id=' +
            req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
        }
    });
};
