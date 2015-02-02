'use strict';

module.exports = {
    /*
     * Grants types for authentication server
     */
    grants: [
        'password',
        'client_credentials', // If choose, don't use refreshToken
        'auth_code',
        'refresh_token'
    ],

    /*
     * Key field in your model to search the user
     */
    keyUsername: 'username',
    keyPassword: 'password',
    keyClientId: 'id',
    keyClientSecret: 'secret',
    keyAccessToken: 'accessToken',
    keyAccessTokenClient: 'client',
    keyAccessTokenUser: 'user',
    keyAccessTokenExpires: 'expires',
    keyRefreshToken: 'refreshToken',
    keyAccessTokenType: 'type',

    /*
     * Life of access tokens in seconds
     * null: to not expire
     */
    accessTokenLifetime: 3600,

    /*
     * Life of refresh tokens in seconds
     * null: to not expire
     */
    refreshTokenLifetime: 1209600,

    /*
     * Life of auth codes in seconds
     */
    authCodeLifetime: 30,

    /*
     * Life time of authorise session
     * null: to not expire
     */
    authoriseLifetime: 3600,

    /*
     * Regex to match auth codes against before checking model
     */
    clientIdRegex: /^[a-z0-9-_]{3,40}$/i,

    /*
     * Templates for login and authorise
     */
    loginTemplate: './components/elefrant-oauth2/templates/login.html',
    authoriseTemplate: './components/elefrant-oauth2/templates/authorise.html',

    /*
     * Connection to redis for saving user session
     */
    connection: {
        port: 6379,
        host: 'localhost',
        db  : undefined,
        user: undefined,
        pass: undefined
    }
};
