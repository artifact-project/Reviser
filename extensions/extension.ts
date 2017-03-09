import Reviser from '../reviser';

type ReviserExtensionListen = 'keydown' | 'keyup' | 'caret';
type ReviserExtensionHandleEvent = (evt: Event, range: Range, selection: Selection, reviser: Reviser) => void;

export interface ReviserExtensionFactory {
	(reviser: Reviser): ReviserExtension;
}

export interface ReviserExtension {
	listen: ReviserExtensionListen[];
	handleEvent: ReviserExtensionHandleEvent;
}

export function createSimpleExtension(keyCode: number, handleEvent: ReviserExtensionHandleEvent): () => ReviserExtensionFactory {
	return function simpleExtensionConfigurator() {
		return function simpleExtensionFactory() {
			return {
				listen: ['keydown'],
				handleEvent(evt: KeyboardEvent, range: Range, selection: Selection, reviser: Reviser) {
					if (evt.keyCode === keyCode) {
						evt.preventDefault();
						handleEvent(evt, range, selection, reviser);
					}
				}
			};
		}
	};
}
