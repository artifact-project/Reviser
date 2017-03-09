import {ReviserExtension, ReviserExtensionFactory} from '../extension';
import {applyStyle, removeStyle} from '../../pen-box/style';
import {KEY_B, KEY_I, KEY_U} from '../../pen-box/keys';
import {ReviserCaret} from '../../reviser';

// Commands
import commandBold from '../../commands/bold';
import commandItalic from '../../commands/italic';
import commandUnderline from '../../commands/underline';

interface BaseStyleExtensionOptions {
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
}

interface IStyle {
	[index: string]: [keyof BaseStyleExtensionOptions, (range: Range) => void];
}

const STYLE: IStyle = {
	[KEY_B]: ['bold', commandBold],
	[KEY_I]: ['italic', commandItalic],
	[KEY_U]: ['underline', commandUnderline],
};

export default function baseStyleConfigurator(options: BaseStyleExtensionOptions = {}): ReviserExtensionFactory {
	return function baseStyleFactory(): ReviserExtension {
		return {
			listen: ['keydown'],
			handleEvent(evt: KeyboardEvent, range: Range, selection, {caret}) {
				const {keyCode} = evt;
				const data = STYLE[keyCode];

				if (data && (evt.metaKey || evt.ctrlKey)) {
					const [style, command] = data;

					// В любом случае отменяем действие по умочанию
					evt.preventDefault();

					// Проверяем на доступность и выполняем команду
					options[style] && command(range);
				}
			}
		}
	};
}
