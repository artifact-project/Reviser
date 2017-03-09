import {wrap} from './bold';

export default function commandItalic(range: Range) {
	wrap(range, 'em');
}
