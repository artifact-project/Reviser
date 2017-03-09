import {
	ZWS, NBSP,
	isTextNode, getNodeLength, removeNode, getSibling,
	getMaxDeepNode, isNode, createTextNode, isBlockElement,
	isZeroSizeElement
} from './dom';
import {deleteContents} from './selection';

export const R_SOFT_LEFT_TRIM = new RegExp(`^[${ZWS} \\n\\r\\t\\uFEFF]+`);
export const R_SOFT_RIGHT_TRIM = new RegExp(`[${ZWS} \\n\\r\\t\\uFEFF]+$`);

function removeCharacter(value: string, offset: number): [string, number] {
	let left = value.substr(0, offset).replace(R_SOFT_RIGHT_TRIM, '');
	let removed = offset - left.length;
	let right = value.substr(offset);

	if (removed) {
		right = right.replace(R_SOFT_LEFT_TRIM, '')
	} else {
		left = left.slice(0, -1).replace(R_SOFT_RIGHT_TRIM, NBSP);
		removed = offset - left.length;
	}

	return [left + right, offset - removed];
}

export function isEmptyString(value: string): boolean {
	return !value.replace(R_SOFT_RIGHT_TRIM, '').length;
}

function getDeepChild(node: Node, type: 'first' | 'last'): Node {
	let method:'firstChild' | 'lastChild' = <any>`${type}Child`;
	let last = node[method];

	if (last) {
		let next;
		while (next = last[method]) {
			last = next;
		}
	}

	return last;
}

function findNextNode(container:HTMLElement, node: Node, type: 'next' | 'prev', removeEmpty?: boolean, removeFirst?: boolean): Node {
	let parent = node.parentNode;
	let cursor = type === 'next' ? node.nextSibling : node.previousSibling;

	if (removeFirst || removeEmpty && !getNodeLength(node)) {
		removeNode(node);
	}

	if (!cursor && parent && parent !== container) {
		cursor = findNextNode(container, parent, type, removeEmpty);

		if (cursor) {
			cursor = getDeepChild(cursor, type == 'next' ? 'first' : 'last');
		}
	}

	return cursor;
}

export default function backspace(range: Range, container: HTMLElement): boolean {
	deleteContents(range);

	let node = range.startContainer;
	let offset = range.startOffset;
	let style;
	let next;
	let removeNext = false;

	console.log('backspace', node, offset);

	if (isTextNode(node)) {
		let value = node.nodeValue;

		if (isEmptyString(value)) {
			next = findNextNode(container, node, 'prev', true, true);
			offset = getNodeLength(next);
			removeNext = true;
		} else {
			[value, offset] = removeCharacter(value, offset);

			if (!value.length) {
				value = ZWS;
				offset = 1;
			}

			if (value.length) {
				node.nodeValue = value;
				next = node;
			}
		}
	} else if (offset || node !== container) {
		[node, offset] = getMaxDeepNode(node, offset, 'end');

		if (isTextNode(node)) {
			next = node;
			removeNext = true;
		} else if (node) {
			// `offset` — в этом случае количество детишек и оно всегда НОЛЬ, потому что это самая глубокая нода
			// Поэтому, нужно узнать
			//  - Блочный ли это элемент или не нулевой размер, то удалить только его.
			//  — Если нулевой размер, то удалить его и попытаться удалить следующий.

			// Добываем стили элемента
			style = window.getComputedStyle(<Element>node);

			if (isNode(node, 'br') || isBlockElement(node, style) || !isZeroSizeElement(node, style)) {
				next = findNextNode(container, node, 'next');

				if (isTextNode(next)) {
					if (isEmptyString(next.nodeValue)) {
						offset = 1;
						next.nodeValue = ZWS;
					}
				} else if (!isNode(next, 'br')){
					const zws = createTextNode(ZWS);

					next = next || node;
					next.parentNode.insertBefore(zws, getSibling(next, 'next'));
					next = zws;
					offset = 1;
				}

			} else {
				next = findNextNode(container, node, 'prev');
				offset = getNodeLength(next);
				removeNext = true;
			}

			removeNode(node);
		}
	}


	if (next) {
		console.log('backspace.next', next, offset);
		range.setStart(next, offset);
		range.setEnd(next, offset);

		if (removeNext) {
			return backspace(range, container);
		}
	} else {
		range.setStart(container, 0);
		range.setEnd(container, 0);
	}

	return true;
}
