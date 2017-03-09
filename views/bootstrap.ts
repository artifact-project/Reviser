import {ReviserViewFactory, ReviserView, default as Reviser} from '../reviser';
import {listenFrom} from '../pen-box/dom';
import {applyStyle, removeStyle} from '../pen-box/style';
import commandBold from '../commands/bold';

interface BootstrapViewConfig {
	height?: string;
}

const toolbarTemplate = (cfg: BootstrapViewConfig) => `
	<div class="btn-toolbar" role="toolbar" aria-label="WYSIWYG toolbar" style="margin-bottom: 10px;">
		<div class="btn-group" role="group" aria-label="Font style">
			<button data-name="bold" type="button" class="btn btn-default" title="Bold">
				<i class="fa fa-bold" aria-hidden="true"></i>
			</button>
	
			<button data-name="italic" type="button" class="btn btn-default" title="Italic">
				<i class="fa fa-italic" aria-hidden="true"></i>
			</button>
	
			<button data-name="underline" type="button" class="btn btn-default" title="Underline">
				<i class="fa fa-underline" aria-hidden="true"></i>
			</button>
	
			<button data-name="strike" type="button" class="btn btn-default" title="Strikethrough">
				<i class="fa fa-strikethrough" aria-hidden="true"></i>
			</button>
		</div>
	
		<div class="btn-group" role="group" aria-label="Colors & Backgrounds">
			<div class="btn-group">
				<button type="button" class="btn btn-default" title="Text color">
					<i class="fa fa-paint-brush" aria-hidden="true"></i>
					<span class="caret"></span>
				</button>
				<div class="dropdown-menu">
					Палтитра
				</div>
			</div>
	
			<button type="button" class="btn btn-default" title="Background color">
				<i class="fa fa-tint" aria-hidden="true"></i>
				<span class="caret"></span>
			</button>
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

function createApplyStyleAction(tagName: string): (range: Range, apply: boolean) => void {
	return (range, apply) => {
		(apply ? applyStyle : removeStyle)(range, tagName)
	};
}

const actions:{[index:string]: (range: Range, apply?:boolean) => void} = {
	'bold': (range) => commandBold(range),
	'italic': createApplyStyleAction('em'),
	'underline': createApplyStyleAction('u'),
	'strike': createApplyStyleAction('s'),
};

export default function bootstrapViewConfigurator(config: BootstrapViewConfig): ReviserViewFactory {
	return function bootstrapViewFactory(reviser: Reviser): ReviserView {
		const view = {
			toolbar: toDOM(toolbarTemplate(config)),
			content: toDOM(contentTemplate(config)),
		};
		const buttons = [].reduce.call(view.toolbar.querySelectorAll('[data-name]'), (btns:any, el: HTMLElement) => {
			btns[el.getAttribute('data-name')] = el;
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

		listenFrom(view.toolbar, 'data-name', (action, target, evt) => {
			evt.preventDefault();

			const range = reviser.getSelectionRange();

			range && actions[action](range, !(<any>reviser.caret)[action]);
			reviser.revertFocus(range);
		});

		return view;
	};
}
