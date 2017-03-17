import {apply} from './bold';
import {removeStyle} from '../pen-box/style';

export function commandApplyStyle(range: Range, style: any, remove?: boolean): void {
	const attrs = {style};

	apply(range, '*', attrs, remove);
}
