import {apply} from './bold';

export default function commandItalic(range: Range) {
	apply(range, 'em');
}
