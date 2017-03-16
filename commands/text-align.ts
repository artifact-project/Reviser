import {getNodeFromRange, createRange, surroundContents} from '../pen-box/selection';
import {
	isBlockElement, isContentEditable, getSibling, getParentSibling, getNodeLength,
	createElement, isBR
} from '../pen-box/dom';

function _findBlockSibling(cursor: Node, vector: 'prev' | 'next'): Node {
	let next;

	do {
		next = getSibling(cursor, vector) || cursor.parentNode;

		if (!next || isBR(next) || isBlockElement(next) || isContentEditable(<HTMLElement>next)) {
			break;
		}

		cursor = next;
	} while (true);

	return cursor;
}

export default function commandTextAlign(range: Range, align: string): void {
	let start = getNodeFromRange(range, 'start');
	let wrapper = start;

	do {
		if (isContentEditable(<HTMLElement>wrapper)) {
			wrapper = null;
			break;
		}

		if (isBlockElement(wrapper)) {
			break;
		}
	} while (wrapper = wrapper.parentNode);

	if (!wrapper) {
		// todo: пустые строки на концах, проверить и удалить
		const [left, right] = [_findBlockSibling(start, 'prev'), _findBlockSibling(start, 'next')];

		surroundContents(createRange(left, right), createElement('div', {
			style: {
				'text-align': align,
			}
		}));
	} else {
		(<HTMLElement>wrapper).style.textAlign = align;
	}
}
