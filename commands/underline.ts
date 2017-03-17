import {apply} from './bold';

export default function commandUnderline(range: Range) {
	apply(range, 'u');
}
