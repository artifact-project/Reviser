import QUnit from 'qunit';
import {applyStyle, removeStyle} from '../pen-box/style';
import {createEditableFragment} from './_helpers';

QUnit.module('Reviser / style / color');

QUnit.test('add', (assert) => {
	const {fragment, range} = createEditableFragment('foo', {select: true});

	applyStyle(range, 'span', {style: {color: 'red'}});
	assert.equal(fragment.innerHTML, '<span style="color:red;">foo</span>');
});

QUnit.test('remove', (assert) => {
	const {fragment, range} = createEditableFragment('<span style="color:red;">foo</span>', {select: true});

	// removeStyle(range, 'span', {style: {color: 'red'}});
});

