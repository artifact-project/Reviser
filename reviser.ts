import {
	setContentEditable, isTextNode, createTextNode, ZWS, normalizeNodes,
	getMaxDeepNode
} from "./pen-box/dom";
import {createRange, setSelection, toRangePlainObject, plainObjectEqual} from "./pen-box/selection";
import {R_SOFT_RIGHT_TRIM} from "./pen-box/backspace";
import {ReviserExtensionFactory, ReviserExtension} from "./extensions/extension";

export const CARET_AT_BEGIN = 'caret-at-begin';
export const CARET_AT_END = 'caret-at-end';

export interface ReviserViewConfigurator {
	(config?: any): ReviserViewFactory;
}

export interface ReviserViewFactory {
	(reviser: Reviser): ReviserView
}

export interface ReviserView {
	toolbar?: HTMLElement;
	content: HTMLElement;
}

export interface ReviserOptions {
	view?: ReviserViewFactory;
	disabled?: boolean;
	spellcheck?: boolean;
	extensions?: ReviserExtensionFactory[];
	defaultCaretPosition?: 'caret-at-begin' | 'caret-at-end';
}

export interface ReviserCaret {
	path: Node[];
	node: Node;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strike?: boolean;
}

const DEFAULT_OPTIONS: ReviserOptions = {
	view: () => ({content: document.createElement('div')}),
	disabled: false,
	spellcheck: false,
	defaultCaretPosition: CARET_AT_BEGIN,
};

export default class Reviser {
	view: ReviserView;

	root: HTMLElement;
	container: HTMLElement;
	initialHTML: string;

	caret: ReviserCaret = {
		node: null,
		path: [],
	};

	lastRange: Range;

	private options: ReviserOptions;
	private extensions: {[index: string]: ReviserExtension[]} = {};

	constructor(root: HTMLElement, options?: ReviserOptions) {
		this.options = {...DEFAULT_OPTIONS, ...options};

		this.view = this.options.view(this);
		this.root = root;
		this.initialHTML = this.root.innerHTML;
		this.container = this.view.content;

		this.root.innerHTML = '';
		(this.view.toolbar) && this.root.appendChild(this.view.toolbar);
		(this.view.content) && this.root.appendChild(this.view.content);

		this._setupEvents();
		this._setupExtensions();

		this.disabled = this.options.disabled;
		this.spellcheck = this.options.spellcheck;
		this.content = this.initialHTML;
	}

	get spellcheck(): boolean {
		return this.options.spellcheck;
	}

	set spellcheck(state: boolean) {
		this.container.spellcheck = state;
		this.options.spellcheck = state;
	}

	get disabled(): boolean {
		return this.options.disabled;
	}

	set disabled(state: boolean) {
		this.options.disabled = state;
		setContentEditable(this.container, !state);
	}

	get content(): string {
		return this.container.innerHTML;
	}

	set content(rawValue: string) {
		const {container} = this;

		container.innerHTML = rawValue.replace(R_SOFT_RIGHT_TRIM, '');

		const {firstChild, lastChild} = container;

		if (firstChild) {
			normalizeNodes(firstChild, lastChild, {
				'b': 'strong',
				'i': 'em',
			});
		}

		if (!isTextNode(lastChild)) {
			container.appendChild(createTextNode(ZWS));
		}
	}

	setCaretPosition(position: string) {
		const range = createRange();
		const {firstChild, lastChild} = this.container;

		switch (position) {
			case CARET_AT_BEGIN:
				range.setStartBefore(firstChild);
				range.setEndBefore(firstChild);
				break;

			case CARET_AT_END:
				range.setStartAfter(lastChild);
				range.setEndAfter(lastChild);
				break;

			default:
				throw new Error(`Reviser#setCaretPosition: ${position} — not supported`);
		}

		this.setSelection(range);
	}

	addExtension(extensionFactory: ReviserExtensionFactory) {
		const extension = extensionFactory(this);

		extension.listen.forEach(name => {
			if (!this.extensions[name]) {
				this.extensions[name] = []
			}

			this.extensions[name].push(extension);
		});
	}

	focus() {
		this.setCaretPosition(this.options.defaultCaretPosition);
	}

	handleEvent(evt: Event) {
		let selection = getSelection();

		if (!selection.rangeCount) {
			return;
		}

		const {type} = evt;
		let range = selection.getRangeAt(0);
		let rangePlainObject = toRangePlainObject(range);

		this._updateCaret(range, type === 'caret');

		this.extensions[type] && this.extensions[type].forEach(extension => {
			extension.handleEvent(evt, range, selection, this);

			const newRangePlainObject = toRangePlainObject(range);

			if (!plainObjectEqual(rangePlainObject, newRangePlainObject)) {
				// Обновляем выделение
				rangePlainObject = newRangePlainObject;
				selection = setSelection(range);
				this._updateCaret(range);
			}
		});


		if (evt.type !== 'blur') {
			this.lastRange = range;
		}
	}

	private _setupEvents() {
		['keydown', 'keyup', 'keypress', 'click', 'focus', 'blur', 'caret'].forEach(name => {
			this.container.addEventListener(name, this, false);
		});
	}

	private _setupExtensions() {
		this.options.extensions.forEach(extension => {
			this.addExtension(extension);
		});
	}

	private _updateCaret(range: Range, silent?: boolean) {
		let [node] = getMaxDeepNode(range.startContainer, range.startOffset, 'end');

		if (this.container.contains(node)) {
			const caret: ReviserCaret = {
				path: [],
				node
			};

			while (node !== this.container) {
				caret.path.push(node);

				if (!isTextNode(node)) {
					switch (node.nodeName.toLowerCase()) {
						case 'strong':
							caret.bold = true;
							break;

						case 'em':
							caret.italic = true;
							break;

						case 'u':
							caret.underline = true;
							break;

						case 's':
							caret.strike = true;
							break;
					}
				}

				node = node.parentNode;
			}

			this.caret = caret;
			!silent && this.container.dispatchEvent(new CustomEvent('caret')); // возможно нужен debounce
		}
	}

	getSelectionRange(): Range {
		return this.lastRange;
	}

	setSelection(range: Range): void {
		setSelection(range);

		this._updateCaret(range);
		this.lastRange = range;
	}

	revertFocus(newRange?: Range): void {
		if (newRange) {
			this.setSelection(newRange);
		} else if (this.lastRange) {
			this.setSelection(this.lastRange);
		} else {
			this.focus();
		}
	}
}
