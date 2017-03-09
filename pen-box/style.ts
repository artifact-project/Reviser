import {
	isNode,
	getNodeLength,
	isTextNode,
	closest,
	isInlineElement,
	splitTextNode,
	getSibling,
	getNextParentSibling,
	unwrap,
	findElementsByTagName,
	getMaxDeepNode
} from './dom';

import {
	createRange,
	getNodeFromRange,
	RangePoint,
	setRangeStart,
	setRangeEnd,
	surroundContents,
} from './selection';

function _insertNode(wrapper: Node, node: Node, type: 'next' | 'prev') {
	if (type === 'next') {
		wrapper.appendChild(node);
	} else {
		wrapper.insertBefore(node, wrapper.firstChild);
	}
}

function _deepUnwrap(container: HTMLElement, tagName: string): [Node, Node] {
	const elements = findElementsByTagName(container, tagName, true);
	let idx = elements.length;
	let result;

	while (idx--) {
		result = unwrap(elements[idx]);
	}

	return result || [container, container];
}


function _toNormalizedRange(range: Range): [Node, number, Node, number] {
	let {
		startContainer: start,
		startOffset,
		endContainer: end,
		endOffset,
	} = range;

	if (!isTextNode(start)) {
		[start, startOffset] = getMaxDeepNode(start, startOffset, 'start');
	}

	if (!isTextNode(end)) {
		[end, endOffset] = getMaxDeepNode(end, endOffset, 'end');
	}

	return [start, startOffset, end, endOffset];
}


export function removeStyle(range: Range, tagName: string): void {
	if (range.collapsed) {
		return;
	}

	const restore: {first: Node, last: Node} = {first: null, last: null};
	let [start, startOffset, end, endOffset] = _toNormalizedRange(range);
	let startWrappedParent = closest(start, tagName);
	let endWrapperParent = closest(end, tagName);

	console.log('removeStyle', [start, startOffset, end, endOffset]);

	startWrappedParent && (restore.first = startWrappedParent.firstChild);
	endWrapperParent && (restore.last = endWrapperParent.lastChild);

	if (startWrappedParent || endWrapperParent) {
		if (startWrappedParent === endWrapperParent) {

			_deepUnwrap(<HTMLElement>startWrappedParent, tagName);
		} else {
			startWrappedParent && _deepUnwrap(<HTMLElement>startWrappedParent, tagName);
			endWrapperParent && _deepUnwrap(<HTMLElement>endWrapperParent, tagName);
		}

		if (endWrapperParent) {
			end = getNodeFromRange(applyStyleBetween([end, endOffset], restore.last, tagName), 'start');
			endOffset = 0;
		}

		if (startWrappedParent && (startOffset || getMaxDeepNode(restore.first, 0, 'start')[0] !== start)) {
			start = getNodeFromRange(applyStyleBetween(restore.first, [start, startOffset], tagName), 'end');
			start = getSibling(start) || getNextParentSibling(start);
			startOffset = 0;
		}
	}

	let cursor = start;

	while (cursor !== end && cursor != null) {
		!isTextNode(cursor) && _deepUnwrap(<HTMLElement>cursor, tagName);
		cursor = cursor.contains(end) && cursor.firstChild || cursor.nextSibling || getNextParentSibling(cursor, 'next');
	}

	range.setStart(start, startOffset);
	range.setEnd(end, endOffset);
}

export function applyStyle(range: Range, tagName: string): void {
	if (range.collapsed) {
		return;
	}

	let [start, startOffset, end, endOffset] = _toNormalizedRange(range);
	let startWrappedParent = closest(start, tagName);
	let endWrapperParent = closest(end, tagName);

	if ((startWrappedParent === endWrapperParent) && isNode(startWrappedParent, tagName)) {
		return;
	}

	if (start === end && isTextNode(start)) {
		if (startOffset < endOffset) {
			setRangeStart(range, start, startOffset);
			setRangeEnd(range, end, endOffset);
			surroundContents(range, tagName);
		}

		return;
	}

	if (startWrappedParent && endWrapperParent) {
		end = _deepUnwrap(<HTMLElement>endWrapperParent, tagName)[1];
		endOffset = getNodeLength(end);
		endWrapperParent = null;
	}

	_applyStyle(
		startWrappedParent || endWrapperParent,
		start,
		startOffset,
		end,
		endOffset,
		endWrapperParent ? 'prev' : 'next',
		tagName
	);

	range.setStart(start, 0);
	range.setEnd(end, 0);
}

export function applyStyleBetween(start: RangePoint, end: RangePoint, tagName: string): Range {
	const range = createRange(start, end);

	applyStyle(range, tagName);
	return range
}

function _applyStyle(
	wrapperParent: Node,
	start: Node,
	startOffset: number,
	end: Node,
	endOffset: number,
	vector: 'next' | 'prev',
	tagName: string
) {
	const isPrevMode = vector === 'prev';

	if (isPrevMode) {
		[start, end] = [end, start];
		endOffset = startOffset;
	}

	let cursor = start;
	let parentChanged: number;
	let range = createRange();
	let endRoot;
	let hasEnd;
	let isEndLast;
	let next;

	if (wrapperParent) {
		cursor = getSibling(wrapperParent, vector);

		if (cursor) {
			!isTextNode(cursor) && (cursor = _deepUnwrap(<HTMLElement>cursor, tagName)[+isPrevMode]);
		} else {
			cursor = getNextParentSibling(wrapperParent, vector);
			wrapperParent = null;

			!isTextNode(cursor) && (cursor = _deepUnwrap(<HTMLElement>cursor, tagName)[+isPrevMode]);
			range.setStartBefore(cursor);
		}
	} else {
		setRangeStart(range, cursor, startOffset);
	}

	do {
		next = null;

		if (cursor === end) {
			hasEnd = true;
			isEndLast = isPrevMode ? !endOffset : getNodeLength(end) === endOffset;
			parentChanged = 0;
		} else {
			hasEnd = cursor.contains(end);

			if (isPrevMode) {
				isEndLast = hasEnd && getMaxDeepNode(cursor, 0, 'end')[0] === end && !endOffset;
			} else {
				isEndLast = hasEnd && getMaxDeepNode(cursor, cursor.childNodes.length, 'end')[0] === end && getNodeLength(end) === endOffset;
			}

			endRoot = endRoot || isEndLast && cursor;

			if (!isInlineElement(cursor) || hasEnd && !isEndLast) {
				next = isPrevMode ? cursor.lastChild : cursor.firstChild;
				parentChanged = +1;
			}

			if (!next && !isEndLast) {
				next = getSibling(cursor, vector);
				parentChanged = 0;

				if (!next) {
					next = getNextParentSibling(cursor, vector);
					parentChanged = -1;
				}
			}

			next && !isTextNode(next) && (next = _deepUnwrap(<HTMLElement>next, tagName)[+isPrevMode]);
		}

		if (wrapperParent) {
			if (parentChanged) {
				isInlineElement(cursor) && _insertNode(wrapperParent, cursor, vector);
				wrapperParent = null;
				range[isPrevMode ? 'setEndAfter' : 'setStartBefore'](next);
			} else {
				cursor = cursor === end && !isEndLast ? splitTextNode(<Text>cursor, endOffset)[+isPrevMode] : cursor;
				_insertNode(wrapperParent, cursor, vector);
			}
		} else {
			if (parentChanged) {
				if (parentChanged > 0) {
					range[isPrevMode ? 'setStartAfter' : 'setEndBefore'](cursor);
				} else {
					range[isPrevMode ? 'setStartBefore' : 'setEndAfter'](cursor);
				}

				surroundContents(range, tagName);
				isPrevMode ? range.setEnd(next, getNodeLength(next)) : range.setStartBefore(next);
			} else if (cursor === end) {
				range[isPrevMode ? 'setStart' : 'setEnd'](cursor, endOffset);
				surroundContents(range, tagName);
				return;
			} else if (hasEnd && isEndLast) {
				range[isPrevMode ? 'setStartBefore' : 'setEndAfter'](endRoot);
				surroundContents(range, tagName);
				return;
			}
		}

		cursor = next;
	} while (next !== null);
}
