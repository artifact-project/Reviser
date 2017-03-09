export const KEY_BACKSPACE = 8;
export const KEY_ENTER = 13;
export const KEY_SPACE = 32;
export const KEY_DELETE = 46;
export const KEY_LEFT = 37;
export const KEY_RIGHT = 39;

export const KEY_B = 'B'.charCodeAt(0);
export const KEY_I = 'I'.charCodeAt(0);
export const KEY_U = 'U'.charCodeAt(0);

export function isSystemKey(evt: KeyboardEvent) {
	return evt.shiftKey || evt.metaKey || evt.ctrlKey || evt.altKey;
}
