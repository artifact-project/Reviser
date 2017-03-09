import {isNode, isTextNode, createElement} from './dom';

export type RangePoint = Node | [Node, number];

export function getSelection(target:Window = window): Selection {
	return target.getSelection();
}

export function setSelection(range: Range): Selection {
	const selection = getSelection();

	selection.removeAllRanges();
	selection.addRange(range);

	return selection;
}

export function getRangeAt(index: number): Range {
	return getSelection().getRangeAt(index);
}

export function createRange(start?: RangePoint, end?: RangePoint) {
	const range = document.createRange();

	if (start) {
		if (isNode(<Node>start)) {
			range.setStartBefore(<Node>start);
		} else {
			range.setStart(<Node>(<any>start)[0], <number>(<any>start)[1]);
		}

		if (end) {
			if (isNode(<Node>end)) {
				range.setEndAfter(<Node>end);
			} else {
				range.setEnd(<Node>(<any>end)[0], <number>(<any>end)[1]);
			}
		}
	}

	return range;
}

export function getNodeFromRange(range: Range, type: 'start' | 'end'): Node {
	const offset: number = (<any>range)[`${type}Offset`];
	const container: Node = (<any>range)[`${type}Container`];

	return isTextNode(container) ? container : container.childNodes[offset ? offset - 1 : 0];
}

export function setRangeStart(range: Range, node: Node, offset?: number) {
	offset ? range.setStart(node, offset) : range.setStartBefore(node);
}

export function setRangeEnd(range: Range, node: Node, offset?: number) {
	offset ? range.setEnd(node, offset) : range.setEndAfter(node);
}

export function surroundContents(range: Range, tagName: string) {
	!range.collapsed && range.surroundContents(createElement(tagName));
}

export function deleteContents(range: Range) {
	!range.collapsed && range.deleteContents();
}

interface RangeObject {
	collapsed: boolean;
	commonAncestor: Node,
	start: Node;
	end: Node;
	startOffset: number;
	endOffset: number;
}

export function toRangePlainObject(range: Range): RangeObject {
	return {
		collapsed: range.collapsed,
		commonAncestor: range.commonAncestorContainer,
		start: range.startContainer,
		end: range.endContainer,
		startOffset: range.startOffset,
		endOffset: range.endOffset,
	};
}

export function plainObjectEqual(left: RangeObject, right: RangeObject) {
	return (
		left.start === right.start &&
		left.end === right.end &&
		left.startOffset === right.startOffset &&
		left.endOffset === right.endOffset
	);
}
