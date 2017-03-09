import {wrap} from './bold';

export default function commandUnderline(range: Range) {
	wrap(range, 'u');
}
