import {ReviserExtension, ReviserExtensionFactory} from '../extension';
import {KEY_ENTER, isSystemKey, KEY_BACKSPACE, KEY_LEFT, KEY_RIGHT, KEY_DELETE} from '../../pen-box/keys';
import {isTextNode, ZWS, removeNode} from '../../pen-box/dom';

export default function zwsConfigurator(): ReviserExtensionFactory {
	return function zwsFactory(): ReviserExtension {
		return {
			listen: ['keydown'],
			handleEvent(evt: KeyboardEvent, range: Range) {
				const {keyCode} = evt;
				let node = range.startContainer;
				let offset = range.startOffset;

				if (!isTextNode(node)) {
					node = node.childNodes[offset] || node.childNodes[offset - 1];
				}

				console.log('zws', node.nodeValue);

				if (!isSystemKey(evt) && isTextNode(node) && node.nodeValue === ZWS) {
					if (keyCode === KEY_LEFT && offset || keyCode === KEY_RIGHT && !offset) {
						console.log('zws.move');
						range[keyCode === KEY_RIGHT ? 'setStartAfter' : 'setStartBefore'](node);
						range[keyCode === KEY_RIGHT ? 'setEndAfter' : 'setEndBefore'](node);
					} else {
						if (keyCode === KEY_BACKSPACE || keyCode === KEY_DELETE) {
							range[keyCode === KEY_BACKSPACE ? 'setStartBefore' : 'setStartAfter'](node);
							range[keyCode === KEY_BACKSPACE ? 'setEndBefore' : 'setEndAfter'](node);
							removeNode(node);
						} else {
							range.selectNode(node);
						}
					}
				}
			}
		}
	};
}
