import {commandApplyStyle} from './style';

export default function commandTextColor(range: Range, color: string): void {
	commandApplyStyle(range, {color}, color === 'none');
}
