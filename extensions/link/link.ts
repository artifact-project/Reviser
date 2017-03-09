import {ReviserExtension, ReviserExtensionFactory} from '../extension';
import {KEY_ENTER, KEY_SPACE} from '../../pen-box/keys';
import {isTextNode, splitTextNode, getMaxDeepNode, NBSP} from '../../pen-box/dom';
import {createRange} from '../../pen-box/selection';
import {applyStyle} from '../../pen-box/style';
import {isEmptyString} from '../../pen-box/backspace';

const R_LINK = /\b(https?|ftp|mailto):\/\/[a-z0-9][^\s]+/i;

export default function linkConfigurator(): ReviserExtensionFactory {
	return function linkFactory(): ReviserExtension {
		return {
			listen: ['keydown'],

			handleEvent(evt: KeyboardEvent, range) {
				const {keyCode} = evt;

				if (range.collapsed && (keyCode === KEY_ENTER || keyCode === KEY_SPACE)) {
					const [target, endOffset] = getMaxDeepNode(range.endContainer, range.endOffset, 'end');
					const value = isTextNode(target) ? target.nodeValue.substr(0, endOffset) : '';
					const startOffset = value.search(R_LINK);

					if (startOffset >= 0) {
						const [link, afterLink] = splitTextNode(<Text>target, endOffset);

						applyStyle(createRange([link, startOffset], [link, endOffset]), 'a');

						if (keyCode === KEY_SPACE && isEmptyString(afterLink.nodeValue)) {
							afterLink.nodeValue = NBSP;

							range.setStartAfter(afterLink);
							range.setEndAfter(afterLink);
							evt.preventDefault();
						}
					}
				}
			}
		};
	};
}
