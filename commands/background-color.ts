import {commandApplyStyle} from './style';

export default function commandBackgroundColor(range: Range, color: string): void {
	commandApplyStyle(range, {'background-color': color}, color === 'none');
}
