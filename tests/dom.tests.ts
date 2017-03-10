import QUnit from 'qunit';
import {createDOMMatcher, createElement} from '../pen-box/dom';

QUnit.module('Reviser / DOM');

QUnit.test('createDOMMatcher / tagName / any', (assert) => {
	const matcher = createDOMMatcher('*');

	assert.ok(matcher.test(createElement('a')), 'match');
	assert.ok(matcher.test(createElement('b')), 'match');
	assert.ok(matcher.test(createElement('div')), 'match');
});

QUnit.test('createDOMMatcher / attributes / any', (assert) => {
	const matcher = createDOMMatcher('a', {href: '*'});

	assert.ok(matcher.test(createElement('a', {href: '#'})), 'match');
	assert.notOk(matcher.test(createElement('a')), 'not match');
});

QUnit.test('createDOMMatcher / attributes / strict', (assert) => {
	const matcher = createDOMMatcher('*', {name: 'top'});

	assert.ok(matcher.test(createElement('a', {name: 'top'})), 'match');
	assert.notOk(matcher.test(createElement('a', {name: 'bottom'})), 'not match');
});

QUnit.test('createDOMMatcher / style / any', (assert) => {
	const matcher = createDOMMatcher('*', {style: {color: '*'}});

	assert.ok(matcher.test(createElement('span', {style: {color: 'red'}})), 'red.match');
	assert.ok(matcher.test(createElement('div', {style: {color: 'blue'}})), 'blue.match');
});

QUnit.test('createDOMMatcher / style / red', (assert) => {
	const matcher = createDOMMatcher('*', {style: {color: 'red'}});

	assert.ok(matcher.test(createElement('span', {style: {color: 'red'}})), 'red.match');
	assert.notOk(matcher.test(createElement('div', {style: {color: 'blue'}})), 'blue.match');
});
