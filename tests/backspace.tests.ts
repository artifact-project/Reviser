import QUnit, {Assert} from 'qunit';

import {TEXT_NODE, NBSP, ZWS} from '../pen-box/dom';
import {testItFactory} from './_helpers';
import backspace from '../pen-box/backspace';

const testIt = testItFactory((range, container) => backspace(range, container), {select: false});

QUnit.module('Reviser / backspace');

testIt([
	{
		from: '', to: '',
		onend(assert: Assert, range: Range, container: HTMLElement) {
			assert.equal(range.startContainer, container);
			assert.equal(range.startOffset, 0);
		}
	},

	{
		from: '&nbsp; &nbsp;', to: '&nbsp;&nbsp;',
		onend(assert: Assert, range: Range) {
			assert.equal(range.startContainer.nodeValue, NBSP + NBSP);
			assert.equal(range.startOffset, 2);
		}
	},

	{from: `<br/>`, to: `${ZWS}`},
	{from: `<br/><br/>`, to: `<br>${ZWS}`},
	{from: `<br/><br/>${ZWS}`, to: `<br>${ZWS}`},
	{from: `<br/><br/>${ZWS}`, to: `<br>${ZWS}`, startOffset: 2},
	{from: `<br/><br/><br/>`, to: `<br><br>${ZWS}`, startOffset: 2},
	{from: `<br/><br/><br/>`, to: `<br><br><br>`, startOffset: 0},

	{
		from: `<i>x</i>`, to: `<i>${ZWS}</i>`,
		onend: (assert: Assert, range: Range) => {
			assert.equal(range.startContainer.parentNode.nodeName, 'I');
			assert.equal(range.startOffset, 1);
		}
	},

	{
		from: `<i>${ZWS}</i>`, to: ``,
		onend(assert: Assert, range: Range, container: HTMLElement) {
			assert.equal(range.startContainer, container);
			assert.equal(range.startOffset, 0);
		}
	},

	{
		from: `<i>x</i>y`, to: `<i>x</i>${ZWS}`,
		onend(assert: Assert, range: Range, container: HTMLElement) {
			assert.equal(range.startContainer.previousSibling, container.firstChild);
			assert.equal(range.startOffset, 1);
		}
	},

	{
		from: `<i>x</i>${ZWS}`, to: `<i>${ZWS}</i>`,
		onend(assert: Assert, range: Range, container: HTMLElement) {
			assert.equal(range.startContainer, container.firstChild.firstChild);
			assert.equal(range.startOffset, 1);
		}
	},

	{
		from: `<b>x</b><span></span>${ZWS}`, to: `<b>${ZWS}</b>`,
		startOffset: 2,
		onend(assert: Assert, range: Range, container: HTMLElement) {
			// assert.equal(range.startContainer, container.firstChild.firstChild);
			// assert.equal(range.startOffset, 0);
		}
	},
]);
