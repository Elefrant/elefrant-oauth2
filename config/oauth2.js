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
     * Regex to match auth codes against before checking model
     */
    clientIdRegex: /^[a-z0-9-_]{3,40}$/i

};
