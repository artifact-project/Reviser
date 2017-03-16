import QUnit, {Assert} from 'qunit';
import {createRange, setSelection} from '../pen-box/selection';
import {createElement, createTextNode, setContentEditable, ZWS} from '../pen-box/dom';
import {setCursorToEnd} from '../pen-box/cursor';

export interface IEditableFragmentOptions {
	select?: boolean;
}

export function createEditableFragment(html: string, options: IEditableFragmentOptions = {}) {
	const range = createRange();
	const fragment = createElement('div');

	if (html) {
		fragment.innerHTML = html;
	} else {
		fragment.appendChild(createTextNode());
	}

	// document.body.insertBefore(fragment, document.body.firstChild);
	// document.getSelection().removeAllRanges();
	// document.getSelection().addRange(range);

	setContentEditable(fragment, true);
	range.setStartAfter(fragment.lastChild);
	range.setEndAfter(fragment.lastChild);

	if (options.select) {
		range.setStartBefore(fragment.firstChild);
	}

	return {
		fragment,
		range,
	};
}


interface ICase {
	message?: string;
	from: string;
	to: string;
	first?: boolean; // проверить что firstChild, всё ещё он
	last?: boolean;
	start?: string;
	startOffset?: number;
	end?: string;
	endOffset?: number;
	onend?: (assert:Assert, range: Range, container?: HTMLElement) => void;
	debug?: boolean;
}

function querySelector(node: Element, selector: string): Node {
	let result: Node = null;

	if (selector === '#root') {
		result = node;
	} else if (selector === '#first') {
		result = node.firstChild;
	} else if (selector === '#last') {
		result = node.lastChild;
	} else if (selector.indexOf(' ') > -1) {
		result = node;

		selector.split(/\s+/).some(name => {
			result = querySelector(<Element>result, name);
			return result == null;
		})
	} else {
		result = node.querySelector(selector);
	}

	return result;
}

export function testItFactory(exec: (range: Range, container?: HTMLElement) => void, options?:IEditableFragmentOptions): (cases:ICase[]) => void {
	return function testIt(cases:ICase[]): void {
		cases.forEach(({message, from, to, first, last, start, startOffset, end, endOffset, onend, debug}) => {
			QUnit.test(message || `${from} -> ${to}`.replace(new RegExp(ZWS, 'g'), '{ZWS}'), (assert) => {
				const {fragment, range} = createEditableFragment(from, options || {select: true});
				const {firstChild, lastChild} = fragment;

				if (start) {
					range.setStart(querySelector(fragment, start), startOffset | 0);
				} else if (startOffset != null) {
					range.setStart(fragment, startOffset);
					range.setEnd(fragment, startOffset);
				}

				if (end) {
					range.setEnd(querySelector(fragment, end), endOffset | 0);
				} else if (endOffset != null) {
					range.setEnd(fragment, endOffset);
				}

				if (debug) {
					document.body.appendChild(fragment);
				}

				exec(range, fragment);

				assert.equal(fragment.innerHTML, to, 'form -> to');

				first && assert.equal(fragment.firstChild, firstChild, 'firstChild');
				last && assert.equal(fragment.lastChild, lastChild, 'lastChild');

				if (!(fragment === range.commonAncestorContainer || fragment.contains(range.commonAncestorContainer))) {
					assert.ok(false, 'selection range');
				}

				debug && setSelection(range);
				onend && onend(assert, range, fragment);
			});
		});
	}
}
