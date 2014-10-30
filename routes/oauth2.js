'use strict';

module.exports = function (server) {
    console.log(server.oauth.grant());
    //server.get('/oauth/token', server.oauth.grant());
    //server.del('/oauth/token', server.oauth.grant());
    server.post('/oauth/token', server.oauth.grant());
    //server.put('/oauth/token', server.oauth.grant());

    server.get('/secret', server.oauth.authorise(), function (req, res, next) {
        res.send('Secret area');
        next();
    });
};
