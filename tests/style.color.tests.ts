import QUnit from 'qunit';
import {applyStyle, removeStyle} from '../pen-box/style';
import {createEditableFragment, testItFactory} from './_helpers';

QUnit.module('Reviser / style / color');

const testIt = testItFactory((range) => applyStyle(range, '*', {style: {color: 'red'}}));

testIt([
	{
		message: 'Просто текст',
		from: 'x',
		to: '<span style="color: red;">x</span>',
	},

	{
		message: 'В середине есть <B> покрашенный цветом',
		from: 'x<b style="color: blue">-</b>y',
		to: '<span style="color: red;">x<b>-</b>y</span>',
	},

	{
		message: 'В середине есть <SPAN> покрашенный цветом, SPAN должен быть вырезан',
		from: '(x<span style="color: blue">-</span>y)',
		to: '<span style="color: red;">(x-y)</span>',
		onend(assert, range) {
			assert.equal(range.startContainer.nodeValue, '(x', 'start');
			assert.equal(range.startOffset, 0, 'start.offset');

			assert.equal(range.endContainer.nodeValue, 'y)', 'end');
			assert.equal(range.endOffset, 2, 'end.offset');
		}
	},

	{
		message: 'В середине есть <SPAN> покрашенный и залитый цветом, SPAN должен остаться',
		from: 'f<span style="color: blue; background: black">o</span>o',
		to: '<span style="color: red;">f<span style="background: black;">o</span>o</span>',
	},

	{
		message: 'Выделен цветной фрагмент',
		from: '<span style="color: blue;">x</span>y',
		to: '<span style="color: red;">xy</span>',
		first: true,
	},

	{
		message: 'Выделение начинается с цветного <SPAN> и заканчивается обычным тестом',
		from: '<span style="color: blue; background: black">x</span>y',
		to: '<span style="color: red; background: black;">x</span><span style="color: red;">y</span>',
		first: true,
	},

	{
		message: 'Выделение начинается с цветного <B> и заканчивается обычным тестом',
		from: '<b style="color: blue;">x--</b>--y',
		to: '<b style="color: red;">x--</b><span style="color: red;">--y</span>',
		first: true,
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN> и заканчивается обычным тестом',
		from: '<span style="color: blue;">x--</span>--y',
		to: '<span style="color: blue;">x</span><span style="color: red;">----y</span>',
		start: '#first #first',
		startOffset: 1,
		first: true,
	},

	{
		message: 'Выделение начинается внутри цветного <B> и заканчивается обычным тестом',
		from: '<b style="color: blue;">x--</b>--y',
		to: '<b style="color: blue;">x</b><b style="color: red;">--</b><span style="color: red;">--y</span>',
		start: '#first #first',
		startOffset: 1,
		first: true,
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN> сразу перед пустым <B> и заканчивается обычным тестом',
		from: '<span style="color: blue;">x<b></b>-</span>y',
		to: '<span style="color: blue;">x</span><span style="color: red;"><b></b>-y</span>',
		start: '#first',
		startOffset: 1,
		first: true,
	},

	{
		message: 'Выделение начинается внутри многоцветного <SPAN> и заканчивается обычным тестом',
		from: '<span style="color: blue; background: black;">x-</span>y',
		to: '<span style="color: blue; background: black;">x</span>' +
			'<span style="color: red; background: black;">-</span>' +
			'<span style="color: red;">y</span>',
		start: '#first #first',
		startOffset: 1,
		first: true,
	},

	{
		message: 'Выделен цветной <SPAN>',
		from: '<span style="color: blue;">x</span>',
		to: '<span style="color: red;">x</span>',
		first: true,
	},

	{
		message: 'Выделен многоцветный <SPAN>',
		from: '<span style="color: blue; background: black;">x</span>',
		to: '<span style="color: red; background: black;">x</span>',
		first: true,
	},

	{
		message: 'Выделение начинается с текста и заканчивается цветным <SPAN>',
		from: 'x<span style="color: blue;">y</span>',
		to: '<span style="color: red;">xy</span>',
		last: true,
	},

	{
		message: 'Выделение начинается с текста и заканчивается многоцветным <SPAN>',
		from: 'x<span style="color: blue; background: black;">y</span>',
		to: '<span style="color: red;">x</span><span style="color: red; background: black;">y</span>',
		last: true,
	},

	{
		message: 'Выделение начинается с текста и заканчивается вынутри цветного <SPAN>',
		from: 'x--<span style="color: blue;">--y</span>',
		to: '<span style="color: red;">x----</span><span style="color: blue;">y</span>',
		end: '#last #first',
		endOffset: 2,
		last: true,
	},

	{
		message: 'Выделение начинается с текста и заканчивается цветным <B>',
		from: 'x--<b style="color: blue;">--y</b>',
		to: '<span style="color: red;">x--</span><b style="color: red;">--y</b>',
		last: true,
	},

	{
		message: 'Выделение находится внутри цветного <SPAN>',
		from: '<span style="color: blue;">x--y</span>',
		to: '<span style="color: blue;">x</span><span style="color: red;">--</span><span style="color: blue;">y</span>',
		start: '#first #first',
		startOffset: 1,
		end: '#first #first',
		endOffset: 3,
	},

	{
		message: 'Выделение находится внутри цветного <B>',
		from: '<b style="color: blue;">x--y</b>',
		to: '<b style="color: blue;">x</b><b style="color: red;">--</b><b style="color: blue;">y</b>',
		start: '#first #first',
		startOffset: 1,
		end: '#first #first',
		endOffset: 3,
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN>',
		from: '<span style="color: blue;">x--y</span>',
		to: '<span style="color: blue;">x-</span><span style="color: red;">-y</span>',
		start: '#first #first',
		startOffset: 2,
	},

	{
		message: 'Выделение начинается внутри цветного <B> и заканчивается в его конце',
		from: '<b style="color: blue;">x--y</b>',
		to: '<b style="color: blue;">x-</b><b style="color: red;">-y</b>',
		start: '#first #first',
		startOffset: 2,
	},

	{
		message: 'Выделение начинается с цветного <SPAN> не доходя до его конца',
		from: '<span style="color: blue;">x--y</span>',
		to: '<span style="color: red;">x-</span><span style="color: blue;">-y</span>',
		end: '#first #first',
		endOffset: 2,
	},

	{
		message: 'Выделение начинается с цветного <B> не доходя до его конца',
		from: '<b style="color: blue;">x--y</b>',
		to: '<b style="color: red;">x-</b><b style="color: blue;">-y</b>',
		end: '#first #first',
		endOffset: 2,
	},

	{
		message: 'Выделение начинается с цветного <SPAN> и заканчивается другим цветным <SPAN>',
		from: '<span style="color: blue;">x-</span><span style="color: green;">-y</span>',
		to: '<span style="color: red;">x--y</span>',
		first: true,
	},

	{
		message: 'Выделение начинается с цветного <SPAN> и заканчивается внутри другого цветного <SPAN>',
		from: '<span style="color: blue;">x-</span><span style="color: green;">+y</span>',
		to: '<span style="color: red;">x-+</span><span style="color: green;">y</span>',
		// first: true,
		end: '#last #first',
		endOffset: 1,
		onend(assert, range) {
			assert.equal(range.startContainer.nodeValue, 'x-', 'start');
			assert.equal(range.startOffset, 0, 'start.offset');
			assert.equal(range.endContainer.nodeValue, '+', 'end');
			assert.equal(range.endOffset, 1, 'end.offset');
		}
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN> и заканчивается в конце другого цветного <SPAN>',
		from: '<span style="color: blue;">x-</span><span style="color: green;">+y</span>',
		to: '<span style="color: blue;">x</span><span style="color: red;">-+y</span>',
		start: '#first #first',
		startOffset: 1,
		onend(assert, range) {
			assert.equal(range.startContainer.nodeValue, '-', 'start');
			assert.equal(range.startOffset, 0, 'start.offset');

			assert.equal(range.endContainer.nodeValue, '+y', 'end');
			assert.equal(range.endOffset, 2, 'end.offset');
		}
	},

	{
		message: 'Выделение начинается с цветного <SPAN> и заканчивается другим многоцветным <SPAN>',
		from: '<span style="color: blue;">x-</span><span style="color: green; background: black;">-y</span>',
		to: '<span style="color: red;">x-</span><span style="color: red; background: black;">-y</span>',
		first: true,
		last: true,
	},

	{
		message: 'Выделение начинается с цветного <SPAN>, а заканчивается цветным <B>',
		from: '<span style="color: blue;">x-</span><b style="color: blue;">-y</b>',
		to: '<span style="color: red;">x-</span><b style="color: red;">-y</b>',
		first: true,
		last: true,
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN> и заканчивается внутри другого цветного <SPAN>',
		from: '<span style="color: blue;">x-</span><span style="color: green;">-y</span>',
		to: '<span style="color: blue;">x</span><span style="color: red;">--</span><span style="color: green;">y</span>',
		first: true,
		last: true,
		start: '#first #first',
		startOffset: 1,
		end: '#last #first',
		endOffset: 1,
	},

	{
		message: 'Выделение начинается внутри цветного <SPAN> и заканчивается внутри цветного <B>',
		from: '<span style="color: blue;">x-</span><b style="color: green;">-y</b>',
		to: '<span style="color: blue;">x</span>' +
			'<span style="color: red;">-</span>' +
			'<b style="color: red;">-</b>' +
			'<b style="color: green;">y</b>',
		first: true,
		last: true,
		start: '#first #first',
		startOffset: 1,
		end: '#last #first',
		endOffset: 1,
	},

	{
		message: 'Выделение начинается внутри многоцветного <I> и заканчивается внутри многоцветного <B>, а между ними текст',
		from: '<i style="color: blue; background: black;">x--</i>wow<b style="color: green; background: yellow;">--y</b>',
		to: '<i style="color: blue; background: black;">x</i>' +
			'<i style="color: red; background: black;">--</i>' +
			'<span style="color: red;">wow</span>' +
			'<b style="color: red; background: yellow;">--</b>' +
			'<b style="color: green; background: yellow;">y</b>',
		start: '#first #first',
		startOffset: 1,
		end: '#last #first',
		endOffset: 2,
	},

	{
		message: 'Выделение начинается внутри <B> и заканчивается вынутри тестом',
		from: '<b>x-.</b>.-y',
		to: '<b>x<span style="color: red;">-.</span></b><span style="color: red;">.-</span>y',
		start: '#first #first',
		startOffset: 1,
		end: '#last',
		endOffset: 2,
		onend(assert, range, frag) {
			assert.equal(range.startContainer, frag.firstChild, 'start');
			assert.equal(range.startOffset, 1, 'start.offset');

			assert.equal(range.endContainer, frag, 'end');
			assert.equal(range.endOffset, 2, 'end.offset');
		}
	},

	{
		message: 'Выделение начинается с [B > SPAN] и заканчивается <SPAN>',
		from: '<b>x<span>--</span></b><span>++</span>y',
		to: '<b>x<span><span style="color: red;">--</span></span></b><span style="color: red;"><span>++</span></span>y',
		start: '#first',
		startOffset: 1,
		end: '#root',
		endOffset: 2,
	},
]);
