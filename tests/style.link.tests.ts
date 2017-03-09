import QUnit from 'qunit';
import {applyStyle} from '../pen-box/style';
import {createEditableFragment} from './_helpers';

QUnit.module('Reviser / style / link');

QUnit.test('Add link', (assert) => {
	const {fragment, range} = createEditableFragment('foo', {select: true});

	applyStyle(range, 'a', {href: 'http://bar'});
	assert.equal(fragment.innerHTML, '<a href="http://bar">foo</a>');
});
