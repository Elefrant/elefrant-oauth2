'use strict';

var component = require('../component'),
		restify = require('restify'),
		should = require('should');

var server = restify.createServer();

describe('oAuth2', function () {

	it('exports an object', function () {
		should.exist(component);
	});

	it('check afterServer', function () {
		console.log(component.afterServer({}, server));
		should(component.afterServer({}, server)).be.ok;
	});

	it('check beforeRoute', function () {
		should(component.afterServer({}, server)).be.ok;
	});

	it('check paramRoute', function () {
		should(component.paramRoute({})).be.an.Object;
	});
});