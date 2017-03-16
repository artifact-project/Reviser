import {wrap} from './bold';
import {removeStyle} from '../pen-box/style';

export function commandApplyStyle(range: Range, style: any, remove?: boolean): void {
	const attrs = {style};

	if (remove) {
		removeStyle(range, '*', attrs);
	} else {
		wrap(range, '*', attrs);
	}
}
