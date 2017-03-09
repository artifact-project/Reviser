import {ZWS, insertAfter, createTextNode, getNodeLength, isNode} from './dom';

export function setCursorTo(range: Range, refNode: Node, offset: number, unsafe = false): void {
	if (isNode(refNode, 'br') && !unsafe) {
		const text = createTextNode(ZWS);

		insertAfter(text, refNode);
		range.setStartAfter(text);
		range.setEndAfter(text);
		return;
	}

	range.setStart(refNode, offset);
	range.setEnd(refNode, offset);
}

export function setCursorToEnd(range: Range, refNode: Node, unsafe = false): void {
	setCursorTo(range, refNode, getNodeLength(refNode), unsafe);
}
