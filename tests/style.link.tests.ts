import QUnit from 'qunit';
import {applyStyle} from '../pen-box/style';
import {createEditableFragment} from './_helpers';

QUnit.module('Reviser / style / link');

QUnit.test('Якорь', (assert) => {
	const {fragment, range} = createEditableFragment('foo', {select: true});

	applyStyle(range, 'a', {name: 'bar'});
	assert.equal(fragment.innerHTML, '<a name="bar">foo</a>');
});

QUnit.test('Ссылка', (assert) => {
	const {fragment, range} = createEditableFragment('foo<div>bar</div>', {select: true});

	applyStyle(range, 'a', {href: 'http://baz'});
	assert.equal(fragment.innerHTML, '<a href="http://baz">foo</a><div><a href="http://baz">bar</a></div>');
});
