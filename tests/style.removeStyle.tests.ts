import QUnit from 'qunit';
import {removeStyle} from '../pen-box/style';
import {testItFactory} from './_helpers';
import {isTextNode} from '../pen-box/dom';

const testIt = testItFactory((range) => removeStyle(range, 'b'));

QUnit.module('Reviser / style / removeStyle');

testIt([
	{from: 'x', to: 'x'},
	{from: '<b>x</b>', to: 'x'},
	{from: '<b>x</b>-', to: 'x-'},
	{from: '-<b>x</b>', to: '-x'},
	{from: '-<b>x</b>-', to: '-x-'},
	{from: '<b>x--x</b>', to: '<b>x</b>--<b>x</b>', start: 'b #first', startOffset: 1, end: 'b #first', endOffset: 3},
	{from: '<b>x-</b><b>-x</b>', to: '<b>x</b>--<b>x</b>', start: 'b #first', startOffset: 1, end: 'b:last-child #first', endOffset: 1},
	{from: '<b>[-<span>-x-</span></b>-]', to: '<b>[-</b><span><b>-</b>x-</span>-]', start: 'span #first', startOffset: 1},
	{
		from: '<div><b>x-[-</b><div><b>!</b></div></div><b>-</b><div><b>]-</b></div><b>x</b>',
		to: '<div><b>x-</b>[-<div>!</div></div>-<div>]<b>-</b></div><b>x</b>',
		start: 'b #first', startOffset: 2,
		end: 'div:nth-child(3) b #first', endOffset: 1
	},

	{
		from: '<b>x----</b>y!',
		to: '<b>x--</b>--y!',
		start: 'b #first', startOffset: 3,
		end: '#last', endOffset: 1,
		onend(assert, range, fragment) {
			assert.ok(isTextNode(range.startContainer), 'start.node');
			assert.equal(range.startOffset, 0, 'start.offset');

			assert.equal(range.endContainer, fragment.lastChild, 'end.node');
			assert.equal(range.endOffset, 1, 'end.offset');
		}
	},
]);
