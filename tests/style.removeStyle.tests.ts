import QUnit from 'qunit';
import {removeStyle} from '../pen-box/style';
import {testItFactory} from './_helpers';
import {isTextNode} from '../pen-box/dom';

const testIt = testItFactory((range) => removeStyle(range, 'b'));
const testColorIt = testItFactory((range) => removeStyle(range, '*', {style: {color: '*'}}));

QUnit.module('Reviser / style / removeStyle');

testIt([
	{
		message: 'Текст без оформления',
		from: 'x', to: 'x',
	},

	{
		message: 'Выделен <B>',
		from: '<b>x</b>', to: 'x',
	},

	{
		message: 'Выделение начинается с <B> и кончается текстом',
		from: '<b>x</b>-', to: 'x-'
	},

	{
		message: 'Выделение начинается и кончается <B>',
		from: '-<b>x</b>', to: '-x',
	},

	{
		message: 'Выделение начинается и кончается тестом, между есть <B>',
		from: '-<b>x</b>-', to: '-x-',
	},

	{
		message: 'Выделен кусок теста внутри <B>',
		from: '<b>x--x</b>',
		to: '<b>x</b>--<b>x</b>',
		start: 'b #first',
		startOffset: 1,
		end: 'b #first',
		endOffset: 3,
	},

	{
		message: 'Выделение начинается внутри одного <B> и кончается внутри другого <B>',
		from: '<b>x-</b><b>-x</b>',
		to: '<b>x</b>--<b>x</b>',
		start: 'b #first',
		startOffset: 1,
		end: 'b:last-child #first',
		endOffset: 1,
	},

	{
		message: 'Выделение начинается внутри <SPAN>, который вложен в <B> и заканчиается тестом за этим <B>',
		from: '<b>[-<span>-x-</span></b>-]',
		to: '<b>[-</b><span><b>-</b>x-</span>-]',
		start: 'span #first',
		startOffset: 1,
	},

	{
		message: 'Выделение начинается в <B>, который вложен в <DIV> и заканчивается <B>, который вложен в [B > DIV]',
		from: '<div><b>x-[-</b><div><b>!</b></div></div><b>-</b><div><b>]-</b></div><b>x</b>',
		to: '<div><b>x-</b>[-<div>!</div></div>-<div>]<b>-</b></div><b>x</b>',
		start: 'b #first', startOffset: 2,
		end: 'div:nth-child(3) b #first', endOffset: 1,
	},

	{
		message: 'Выделение начинается в <B> и заканчивается внутри теста за этим <B>',
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

QUnit.module('Reviser / style / removeStyle / color');

testColorIt([
	{
		message: 'Цветной <SPAN>',
		from: '<span style="color: red">x</span>',
		to: 'x',
	},

	{
		message: 'Цветной <B>',
		from: '<b style="color: red">x</b>',
		to: '<b>x</b>',
	},

	{
		message: 'Многоцветный <SPAN>',
		from: '<span style="color: red; background: black;">x</span>',
		to: '<span style="background: black;">x</span>',
	},

	{
		message: 'Многоцветный <B>',
		from: '<b style="color: red; background: black;">x</b>',
		to: '<b style="background: black;">x</b>',
	},

	{
		message: 'Выделен цветной <SPAN> и текст',
		from: '<span style="color: red;">x</span>--y',
		to: 'x--y',
	},

	{
		message: 'Выделен цветной <B> и текст',
		from: '<b style="color: red;">x</b>--y',
		to: '<b>x</b>--y',
	},

	{
		message: 'Выделен текст и цветной <SPAN>',
		from: 'x--<span style="color: red;">y</span>',
		to: 'x--y',
	},

	{
		message: 'Выделен текст и цветной <B>',
		from: 'x--<b style="color: red;">y</b>',
		to: 'x--<b>y</b>',
	},

	{
		message: 'Выделение начинается в цветном <SPAN> и заканчивается текстом',
		from: '<span style="color: red;">x-</span>-y',
		to: '<span style="color: red;">x</span>--y',
		start: '#first #first',
		startOffset: 1,
	},

	// {
	// 	message: 'Выделение начинается в цветном <B> и заканчивается текстом',
	// 	from: '<b style="color: red;">x-</b>-y',
	// 	to: '<b style="color: red;">x</b><b>-</b>-y',
	// 	start: '#first #first',
	// 	startOffset: 1,
	// },
]);
