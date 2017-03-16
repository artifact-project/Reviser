import {deleteContents} from './selection';
import {
	createElement, getNodeLength, isTextNode, getSibling, splitTextNode, isInlineElement,
	createTextNode, ZWS, getParentSibling
} from './dom';
import {setCursorToEnd} from './cursor';
import {isEmptyString} from './backspace';

export default function enter(range: Range, container: HTMLElement): boolean {
	deleteContents(range);

	let node = range.startContainer;
	let offset = range.startOffset;
	let br = createElement('br');

	console.log('enter', node, offset, getNodeLength(node));

	if (isTextNode(node)) {
		let {parentNode} = node;

		if (offset > 0) {
			if (getNodeLength(node) === offset) {
				let next = getSibling(node);

				if (!next) {
					parentNode = node.parentNode;
					next = parentNode.nextSibling;
				}

				node = next;
			} else {
				node = splitTextNode(<Text>node, offset)[1];
			}
		}

		if (isTextNode(node) && isEmptyString(node.nodeValue)) {
			node.nodeValue = ZWS;
		}

		parentNode.insertBefore(br, node);
	} else {
		range.commonAncestorContainer.insertBefore(br, node.childNodes[offset]);
	}

	let next = <HTMLElement>getSibling(<HTMLElement>br);

	if (!next || !isInlineElement(node)) {
		const text = createTextNode(ZWS);

		br.parentNode.insertBefore(text, next);
		setCursorToEnd(range, text);

		return true;
	}

	range.setStartAfter(br);
	range.setEndAfter(br);

	return true;
}
