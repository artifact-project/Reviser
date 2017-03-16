import {ReviserViewFactory, ReviserView, default as Reviser} from '../reviser';
import {listenFrom} from '../pen-box/dom';
import commandBold, {wrap as commandWrap} from '../commands/bold';
import commandItalic from '../commands/italic';
import commandUnderline from '../commands/underline';
import commandStrike from '../commands/strike';
import {removeStyle} from '../pen-box/style';

interface BootstrapViewConfig {
	height?: string;
}


function createApplyStyleAction(styleName: string): (range: Range, value: string) => void {
	return (range, value: string) => {
		const attrs = {
			style: {
				[styleName]: value,
			}
		};

		if (value === 'none') {
			removeStyle(range, '*', attrs);
		} else {
			commandWrap(range, '*', attrs);
		}
	};
}

const colors = [
	'none', '#ffffff', '#bcbcbc', '#6c6c6c', '#454545', '#2c2c2c', '#000000',
	'#fcc9c9', '#fe8c8c', '#fe5e5e', '#fd5b36', '#f82e00', '#fb2c2c', '#bf0000',
	'#ffe1c6', '#ffc998', '#fcad66', '#ff9331', '#ff810f', '#ff9c00', '#ff6000',
	'#d8ffe0', '#92f9a7', '#34ff5d', '#b2fb82', '#89f641', '#5cd809', '#05840b',
	'#b7e9ec', '#56e5ed', '#21cad3', '#03939b', '#039b80', '#006d5a', '#00484c',
	'#cac8e9', '#9690ea', '#6a60ec', '#4866e7', '#173bd3', '#001c91', '#001055',
	'#f3cafb', '#e287f4', '#c238dd', '#a476af', '#b53dd2', '#7a00c7', '#520384'
];

function colorNoneDiv(): string {
	return `<div style="
		width: 100%;
		height: 100%;
		background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2016%2014%27%20stroke%3D%27%23f00%27%3E%3Cline%20stroke-width%3D%272%27%20x1%3D%270%27%20x2%3D%2716%27%20y1%3D%2714%27%20y2%3D%270%27%20/%3E%3C/svg%3E');
	"></div>`;
}

function colorDivFactory(this: string, hex: string): string {
	return `<div
		data-action="${this}"
		data-value="${hex}"
		style="
			cursor: pointer;
			display: inline-block;
			width: 17px;
			height: 15px;
			background: ${hex};
			margin: 2px;
			border: 1px solid #ccc;
		"
	>${hex === 'none' ? colorNoneDiv() : ''}</div>`;
}

const toolbarTemplate = (cfg: BootstrapViewConfig) => `
	<div class="btn-toolbar" role="toolbar" aria-label="WYSIWYG toolbar" style="margin-bottom: 10px;">
		<div class="btn-group" role="group" aria-label="Font style">
			<button data-action="bold" type="button" class="btn btn-default" title="Bold">
				<i class="fa fa-bold" aria-hidden="true"></i>
			</button>
	
			<button data-action="italic" type="button" class="btn btn-default" title="Italic">
				<i class="fa fa-italic" aria-hidden="true"></i>
			</button>
	
			<button data-action="underline" type="button" class="btn btn-default" title="Underline">
				<i class="fa fa-underline" aria-hidden="true"></i>
			</button>
	
			<button data-action="strike" type="button" class="btn btn-default" title="Strikethrough">
				<i class="fa fa-strikethrough" aria-hidden="true"></i>
			</button>
		</div>
	
		<div class="btn-group" role="group" aria-label="Colors & Backgrounds">
			<div class="btn-group">
				<button data-action="dropdown:toggle" type="button" class="btn btn-default" title="Text color">
					<i class="fa fa-paint-brush" aria-hidden="true"></i>
					<span class="caret"></span>
				</button>
				<div class="dropdown-menu" style="width: 160px; padding: 5px;">
					${colors.map(colorDivFactory, 'text-color').join('')}
				</div>
			</div>

			<div class="btn-group">
				<button data-action="dropdown:toggle" type="button" class="btn btn-default" title="Background color">
					<i class="fa fa-tint" aria-hidden="true"></i>
					<span class="caret"></span>
				</button>
				<div class="dropdown-menu" style="width: 160px; padding: 5px;">
					${colors.map(colorDivFactory, 'background-color').join('')}
				</div>
			</div>
		</div>
	
		<div class="btn-group" role="group" aria-label="Font style">
			<button type="button" class="btn btn-default" title="Align left">
				<i class="fa fa-align-left" aria-hidden="true"></i>
			</button>
	
			<button type="button" class="btn btn-default" title="Align center">
				<i class="fa fa-align-center" aria-hidden="true"></i>
			</button>
	
			<button type="button" class="btn btn-default" title="Align right">
				<i class="fa fa-align-right" aria-hidden="true"></i>
			</button>
	
			<button type="button" class="btn btn-default" title="Align justify">
				<i class="fa fa-align-justify" aria-hidden="true"></i>
			</button>
		</div>
	</div>
`;

const contentTemplate = ({height}: BootstrapViewConfig) => `
	<div style="
		padding: 10px;
		overflow: scroll;
		outline: none;
		border-radius: 4px;
		box-shadow: inset 0 0 4px rgba(0,0,0,.5);
		height: ${height || 'auto'}
	"></div>
`;

function toDOM(html: string): HTMLElement {
	const el = document.createElement('div');
	el.innerHTML = html.trim();
	return <HTMLElement>el.firstChild;
}


let activeDropdown: HTMLElement;

function dropdownToggle(evt: Event, menu: HTMLElement) {
	const dropdown = menu.parentElement;

	if (activeDropdown && activeDropdown !== dropdown) {
		(<HTMLElement>activeDropdown.lastElementChild).style.display = 'none';
	}

	menu.style.display = menu.style.display == 'block' ? 'none' : 'block';
	activeDropdown = dropdown;
}

document.addEventListener('click', ({target}) => {
	if (activeDropdown && !activeDropdown.firstElementChild.contains(<Node>target)) {
		(<HTMLElement>activeDropdown.lastElementChild).style.display = 'none';
		activeDropdown = null;
	}
});

const actions:{[index:string]: (range: Range, value?: string) => void} = {
	'bold': (range) => commandBold(range),
	'italic': (range) => commandItalic(range),
	'underline': (range) => commandUnderline(range),
	'strike':(range) => commandStrike(range),
	'text-color': createApplyStyleAction('color'),
	'background-color': createApplyStyleAction('background-color'),
};

export default function bootstrapViewConfigurator(config: BootstrapViewConfig): ReviserViewFactory {
	return function bootstrapViewFactory(reviser: Reviser): ReviserView {
		const view = {
			toolbar: toDOM(toolbarTemplate(config)),
			content: toDOM(contentTemplate(config)),
		};
		const buttons = [].reduce.call(view.toolbar.querySelectorAll('[data-action]'), (btns:any, el: HTMLElement) => {
			btns[el.getAttribute('data-action')] = el;
			return btns;
		}, {});

		// Обработка каретки
		reviser.addExtension(() => ({
			listen: ['caret'],
			handleEvent() {
				buttons.bold.style.backgroundColor = reviser.caret.bold ? '#b3ffd5' : '';
				buttons.italic.style.backgroundColor = reviser.caret.italic ? '#b3ffd5' : '';
				buttons.underline.style.backgroundColor = reviser.caret.underline ? '#b3ffd5' : '';
				buttons.strike.style.backgroundColor = reviser.caret.strike ? '#b3ffd5' : '';
			}
		}));

		listenFrom(view.toolbar, 'click', 'data-action', (action, target, evt) => {
			evt.preventDefault();

			const range = reviser.getSelectionRange();

			if (action === 'dropdown:toggle') {
				dropdownToggle(evt, <HTMLElement>target.nextElementSibling);
			} else {
				range && actions[action] && actions[action](
					range,
					target.getAttribute('data-value')
				);

				reviser.revertFocus(range);
			}
		});

		return view;
	};
}
