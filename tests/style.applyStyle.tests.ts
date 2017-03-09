import QUnit from 'qunit';
import {applyStyle} from '../pen-box/style';
import {testItFactory} from './_helpers';

QUnit.module('Reviser / style / applyStyle');

const testIt = testItFactory((range) => applyStyle(range, 'b'));

// Голый текст
testIt([
	{from: 'x', to: '<b>x</b>'},
	{from: 'x<i>y</i>', to: '<b>x<i>y</i></b>'},
	{from: 'x<i>y</i>', to: 'x<b><i>y</i></b>', start: '#first', startOffset: 1},
	{from: 'x<i>yz</i>', to: '<b>x</b><i><b>y</b>z</i>', end: 'i #first', endOffset: 1},
	{from: 'x<i>y<u>z<em>y</em>x</u></i>', to: '<b>x</b><i><b>y</b><u><b>z<em>y</em></b>x</u></i>', end: 'em', endOffset: 1},
	{from: 'x<i>y<u>z<em>yx</em></u></i>', to: '<b>x</b><i><b>y</b><u><b>z</b><em><b>y</b>x</em></u></i>', end: 'em #first', endOffset: 1},
	{from: 'x<i>y<u>z<div>y</div>x</u></i>', to: '<b>x</b><i><b>y</b><u><b>z</b><div><b>y</b></div>x</u></i>', end: 'div', endOffset: 1},
]);


// Тег <b> имеется в начале
testIt([
	{from: '<b>x</b>', to: '<b>x</b>', first: true},
	{from: '<b>x</b>y', to: '<b>xy</b>', first: true},

	{from: '<b>x</b><span>y</span>', to: '<b>x<span>y</span></b>', first: true},
	{from: '<b>x</b><span>y</span>z', to: '<b>x<span>y</span>z</b>', first: true},
	{from: '<b>x</b>y<span>z</span>', to: '<b>xy<span>z</span></b>', first: true},

	{from: '<b>x</b><div>y</div>', to: '<b>x</b><div><b>y</b></div>'},
	{from: '<b>x</b><div>y</div>z', to: '<b>x</b><div><b>y</b></div><b>z</b>'},
	{from: '<b>x</b><div><i>y</i><div>Y</div></div>z', to: '<b>x</b><div><b><i>y</i></b><div><b>Y</b></div></div><b>z</b>'},
	{from: '<b>x</b>y<div>z</div>', to: '<b>xy</b><div><b>z</b></div>', first: true},

	{from: '<b>xy</b>', to: '<b>xy</b>', first: true, start: 'b', startOffset: 1},
	{from: '<b>x</b>y', to: '<b>xy</b>', first: true, start: 'b', startOffset: 1},
	{from: '<b>x</b>yz', to: '<b>xy</b>z', first: true, end: '#last', endOffset: 1},
	{from: '<b>x</b><div>yz</div>', to: '<b>x</b><div><b>y</b>z</div>', end: 'div #first', endOffset: 1},

	{from: '<i>x<b>y</b></i>z', to: '<i>x<b>y</b></i><b>z</b>', start: 'b #first'},
	{from: '<i>x<b>y</b>Y</i>z', to: '<i>x<b>yY</b></i><b>z</b>', start: 'b #first'},
]);

// <b/> в конце
testIt([
	{from: 'x<b>y</b>', to: '<b>xy</b>'},
	{from: 'x--⪧y<b>z</b>', to: 'x-<b>-⪧yz</b>', start: '#first', startOffset: 2},
	{from: '<i>x--y</i><b>z</b>', to: '<b><i>x--y</i>z</b>'},
	{from: 'x<div>--</div>y<b>z</b>', to: '<b>x</b><div><b>--</b></div><b>yz</b>'},
	{from: 'x<div>--</div>y<b>z</b>', to: 'x<div><b>--</b></div><b>yz</b>', start: '#first', startOffset: 1},
	{from: 'x--<div>--</div>y<b>z</b>', to: 'x<b>--</b><div><b>--</b></div><b>yz</b>', start: '#first', startOffset: 1},
	{from: 'x<div>--</div>y<b>z</b>', to: 'x<div>-<b>-</b></div><b>yz</b>', start: 'div #first', startOffset: 1},
	{from: 'x<div>-<em>!</em>-</div><i>y<b>z</b></i>', to: 'x<div>-<b><em>!</em>-</b></div><i><b>yz</b></i>', start: 'em #first', startOffset: 0, end: 'b', endOffset: 1},
	{from: 'x<div>-<em>!?</em>-</div><i>y<b>z</b></i>', to: 'x<div>-<em>!<b>?</b></em><b>-</b></div><i><b>yz</b></i>', start: 'em #first', startOffset: 1, end: 'b', endOffset: 1},
]);

// <b/> в начале и конце
testIt([
	{from: '<b>x</b><b>y</b>', to: '<b>xy</b>'},
	{from: '<b>x</b>-<div>-<b>y</b></div>', to: '<b>x-</b><div><b>-y</b></div>'},
	{from: '<b>x</b>-<div>-<b>y-<i>z</i>!</b></div>', to: '<b>x-</b><div><b>-y-<i>z</i>!</b></div>', end: 'b:last-child #first', endOffset: 1},
]);


// <b/> где-то между началом и концом
testIt([
	{from: 'x<b>-</b>y', to: '<b>x-y</b>'},
	{from: '<b>x</b><b>-</b>y', to: '<b>x-y</b>'},
	{from: '<b>x</b>-<b>-</b>y', to: '<b>x--y</b>'},
	{from: '<div>x</div><b>-</b>y', to: '<div><b>x</b></div><b>-y</b>'},
	{from: '<div><b>x</b></div><b>-</b>y', to: '<div><b>x</b></div><b>-y</b>', start: 'b #first'},
]);
