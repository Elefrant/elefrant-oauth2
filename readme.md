# elefrant-oauth2 Component

[![wercker status](https://app.wercker.com/status/b7d41c1834c19d26ef9ca722a320b6a5/s/master "wercker status")](https://app.wercker.com/project/bykey/b7d41c1834c19d26ef9ca722a320b6a5)

[![Dependency Status](https://gemnasium.com/Elefrant/elefrant-oauth2.svg)](https://gemnasium.com/Elefrant/elefrant-oauth2)


## Usage

Integarte oAuth 2.0 with elefrant.

When the component is enable, all routes from the API are `block` to non users.
If you want to make a route `public`:

```js

module.exports = [{
	path: '/',
	method: 'GET',
	oauth: false,
	version: [
		'1.0.0'
	],
	action: 'users.v1.getAll'
}];

```


## Dependable components

**elefrant-template-engine**

**elefrant-session**


## Structure

### Config `/config/`

Copy `oauth2.js` from `./components/elefrant-oauth2` to main config folder.

*note:* in `config/server` the property
```js
...
bodyParser: {
	mapParams: false
},
...
```


#### Grants

Select the grunt types for the authentication server.

```js
[
    'password',
    'refresh_token'
]
```


## Launch tests

Just put in the console: `npm test`


## License

MIT © [Elefrant](http://elefrant.com/#/license)
