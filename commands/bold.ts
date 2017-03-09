import {
	closest, getMaxDeepNode, isTextNode, createElement, splitTextNode, getNodeLength,
	createTextNode, ZWS, removeNode, insertAfter, getSibling
} from '../pen-box/dom';
import {removeStyle, applyStyle} from '../pen-box/style';
import {createRange} from '../pen-box/selection';
import {isEmptyString} from '../pen-box/backspace';


export function wrap(range: Range, tagName: string) {
	const {startContainer, startOffset} = range;
	const startWrapper = closest(startContainer, tagName);
	let [cursor, offset] = getMaxDeepNode(startContainer, startOffset, 'start');

	if (range.collapsed) {
		// Просто курсор в тексте
		if (startWrapper) {
			if (getNodeLength(startWrapper) === 1 && isEmptyString(startWrapper.firstChild.nodeValue)) {
				// Пустая нода, просто удаляем и ставим курсор за ней
				range.setStartAfter(startWrapper);
				range.setEndAfter(startWrapper);
				removeNode(startWrapper);
			} else {
				let [last, lastOffset] = getMaxDeepNode(startWrapper, getNodeLength(startWrapper), 'end');

				if (last === cursor && lastOffset === startOffset) {
					// Курсор стоит вконце строки, поэтому нужно создать пустую ноду
					// и вставить её после врапера
					const zws = createTextNode(ZWS);

					insertAfter(zws, startWrapper);
					range.setStart(zws, 1);
					range.setEnd(zws, 1);

					return;
				}

				// Убираем форматирование
				const wrapperRange = createRange();

				wrapperRange.selectNode(startWrapper);
				removeStyle(wrapperRange, tagName);

				// Востанавливаем позицию курсора
				range.setStart(startContainer, startOffset);
				range.setEnd(startContainer, startOffset);
			}
		} else {
			// Добавляем пустой тег и фокусируемся внутри него
			const wrapper = createElement(tagName);

			if (isTextNode(cursor) && isEmptyString(cursor.nodeValue)) {
				// Пустая нода или ZWS
				cursor.nodeValue = ZWS;
				cursor.parentNode.insertBefore(wrapper, cursor);
				wrapper.appendChild(cursor);
			} else {
				wrapper.appendChild(createTextNode(ZWS));

				if (cursor) {
					let {parentNode} = cursor;

					if (isTextNode(cursor)) {
						if (getNodeLength(cursor) === offset) {
							cursor = cursor.nextSibling;
						} else if (offset) {
							[, cursor] = splitTextNode(<Text>cursor, offset);
						}
					}

					parentNode.insertBefore(wrapper, cursor);
				} else {
					startContainer.appendChild(wrapper);
				}
			}

			range.setStart(wrapper, 1);
			range.setEnd(wrapper, 1);
		}
	} else {
		// Выделен текст
		(startWrapper ? removeStyle : applyStyle)(range, tagName);
	}
}


/**
 * Bold: add/remove/change
 * @param range
 */
export default function commandBold(range: Range) {
	wrap(range, 'strong');
}
