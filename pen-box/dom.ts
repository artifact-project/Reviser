export const ZWS = String.fromCharCode(8203);
export const NBSP = String.fromCharCode(160);

export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;

export const SELF_CLOSED = {
	area: 1, base: 1, basefont: 1, br: 1, col: 1, command: 1, dialog: 1, embed: 1, hr: 1, img: 1,
	input: 1, isindex: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1
};

export const INLINE_NODE: Object = {
	a: 1, abbr: 1, area: 1, audio: 1, b: 1, bdi: 1, bdo: 1, br: 1, button: 1, canvas: 1, cite: 1,
	code: 1, command: 1, datalist: 1, del: 1, dfn: 1, em: 1, embed: 1, i: 1, iframe: 1, img: 1,
	input: 1, ins: 1, kbd: 1, keygen: 1, label: 1, map: 1, mark: 1, meter: 1, noscript: 1, object: 1,
	output: 1, progress: 1, q: 1, ruby: 1, s: 1, samp: 1, script: 1, select: 1, small: 1, span: 1,
	strong: 1, sub: 1, sup: 1, textarea: 1, time: 1, u: 1, var: 1, video: 1, wbr: 1, acronym: 1,
	applet: 1, basefont: 1, big: 1, font: 1, isindex: 1, strike: 1, style: 1, tt: 1
};

export function toCSSText(style: any): string {
	let cssText = '';

	if (style) {
		if (typeof style === 'string') {
			cssText = style;
		} else {
			for (const key in style) {
				if (style.hasOwnProperty(key)) {
					cssText += `${key}:${style[key]};`
				}
			}
		}
	}

	return cssText;
}

export function createElement(name: string, attributes?: {[index:string]: any}): HTMLElement {
	const element = document.createElement(name);

	if (attributes) {
		for (const key in attributes) {
			if (attributes.hasOwnProperty(key)) {
				const value = attributes[key];

				if (key === 'style') {
					element.setAttribute(key, toCSSText(value));
				} else if (key in element) {
					(<any>element)[key] = attributes[key]
				} else {
					element.setAttribute(key, attributes[key]);
				}
			}
		}
	}

	return element;
}

export function listenFrom(container: HTMLElement, attr: string, handle: (action: string, target: HTMLElement, evt: Event) => void) {
	function handleEvent(evt: Event) {
		let target: Node = <Node>evt.target;

		while (target !== container) {
			if (target.nodeType === ELEMENT_NODE) {
				const action = (<Element>target).getAttribute(attr);

				if (action) {
					handle(action, <HTMLElement>target, evt);
					break;
				}
			}

			target = target.parentNode;
		}
	}

	container.addEventListener('click', handleEvent, false);

	return function dispose() {
		container.removeEventListener('click', handleEvent, false);
	};
}


export function createTextNode(value: string = ''): Text {
	return document.createTextNode(value);
}

export function isNode(node: Node, name?: string): boolean {
	return node ? node.nodeType > 0 && (name == null || name.toLowerCase() === node.nodeName.toLowerCase()) : false;
}

export function isTextNode(node: Node): boolean {
	return node ? node.nodeType === TEXT_NODE : false;
}

export function isBR(node: Node): boolean {
	return node ? node.nodeName === 'BR' : false;
}

export function insertAfter(newNode: Node, refNode: Node): void {
	refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}

export function removeNode(node: Node): void {
	node && node.parentNode && node.parentNode.removeChild(node);
}

export function getNodeLength(node: Node): number {
	return node ? (isTextNode(node) ? node.nodeValue.length : node.childNodes.length) : 0;
}

export function setContentEditable(node: HTMLElement, state: boolean) {
	node.contentEditable = <string><any>state;
}

export function isEmptyNode(node: Node): boolean {
	return !getNodeLength(node);
}

export function closest(node: Node, tagName: string): Node | null {
	while (node && !isNode(node, tagName)) {
		node = node.parentNode;
	}

	return node;
}

export function isSelfClosedElement(node: Node): boolean {
	return node ? SELF_CLOSED.hasOwnProperty(node.nodeName.toLowerCase()) : false;
}

export function isInlineElement(node: Node): boolean {
	return node ? (INLINE_NODE.hasOwnProperty(node.nodeName.toLowerCase()) || isTextNode(node)) : false;
}

export function isBlockElement(node: Node, style?:CSSStyleDeclaration): boolean {
	if (node && !isTextNode(node)) {
		style = style || window.getComputedStyle(<Element>node);
		return (style.display && style.display !== 'auto') ? style.display === 'block' : !isInlineElement(node);
	} else {
		return false;
	}
}

export function isZeroSizeElement(node: Node, style?:CSSStyleDeclaration): boolean {
	if (node) {
		style = style || window.getComputedStyle(<Element>node);

		return (
			(style.display === 'none') ||
			!(
				parseInt(style.width, 10) ||
				parseInt(style.marginLeft, 10) ||
				parseInt(style.marginRight, 10)
			)
		)
	} else {
		return false;
	}
}

export function splitTextNode(node: Text, offset: number): [Text, Text] {
	const {parentNode, nodeValue} = node;
	const leftNode = document.createTextNode(nodeValue.substr(0, offset));

	node.nodeValue = nodeValue.substr(offset);
	parentNode.insertBefore(leftNode, node);

	return [leftNode, node];
}

export function unwrap(target: Element, newParent?: Element): [Node, Node] {
	const result: [Node, Node] = [target.firstChild, target.lastChild];
	const parent = target.parentNode;

	if (newParent) {
		parent.insertBefore(newParent, target);
	}

	while (target.firstChild) {
		if (newParent) {
			newParent.appendChild(target.firstChild);
		} else {
			parent.insertBefore(target.firstChild, target);
		}
	}

	parent.removeChild(target);

	return result;
}

export function getSibling(node: Node, type: 'next' | 'prev' = 'next'): Node {
	return node ? (type === 'next' ? node.nextSibling : node.previousSibling) : null;
}

export function getNextParentSibling(node: Node, type: 'next' | 'prev' = 'next', context?: HTMLElement): Node {
	const {parentNode} = node;

	if (node === context || parentNode === node) {
		return null;
	}

	return parentNode ? getSibling(parentNode, type) || getNextParentSibling(parentNode, type) : null;
}

export function findElementsByTagName(container: HTMLElement, tagName: string, andRoot?:boolean): Element[] {
	const elements = container.getElementsByTagName(tagName);
	const length = elements.length;
	const results = [];

	andRoot && isNode(container, tagName) && results.push(container);

	if (length > 0) {
		if (length === 1) {
			results.push(elements[0]);
		} else {
			for (let i = 0; i < length; i++) {
				results.push(elements[i]);
			}
		}
	}

	return results;
}

export function getMaxDeepNode(node: Node, offset: number, type: 'start' | 'end'): [Node, number] {
	if (isTextNode(node) || isSelfClosedElement(node)) {
		return [node, offset];
	} else {
		const nextNode = offset ? node.childNodes[offset] || node.childNodes[offset - 1] : node.firstChild || node;
		const nextLength = getNodeLength(nextNode);

		if (nextLength) {
			return nextNode ? getMaxDeepNode(nextNode, type === 'start' ? 0 : nextLength, type) : [null, null];
		} else {
			return [nextNode, 0];
		}
	}
}

export function getNodeIndex(node: Node) {
	let index = 0;

	while (node = node.previousSibling) {
		index++;
	}

	return index;
}

interface NormalizeReplaceMap {
	[index:string]: string;
}

export function normalizeNodes(start: Node, end: Node, replace?:NormalizeReplaceMap) {
	let cursor = start;
	let mainLoop;

	do {
		const name = cursor.nodeName.toLowerCase();

		if (replace.hasOwnProperty(name)) {
			[cursor] = unwrap(<Element>cursor, createElement(replace[name]));
		}

		mainLoop = cursor !== end;
		cursor = !isTextNode(cursor) && cursor.firstChild || cursor.nextSibling || cursor.parentNode.nextSibling;
	} while (mainLoop);
}

export function cloneNode(node: Node, deep?: boolean): Node {
	return node.cloneNode(deep);
}

export function createDOMStyleMatcher(style: any) {
	const keys = Object.keys(style);
	const length = keys.length;

	return function styleMatcher(elementStyle: any) {
		if (length) {
			let idx = length;

			while (idx--) {
				const key = keys[idx];
			 	const value = style[key];
			 	const actualValue = elementStyle[key];
			 	let check = true;

				console.log(key, value, actualValue);

			 	if (value === '*') {
			 		check = !!actualValue;
			 	} else {
			 		check = value === actualValue
			 	}

			 	if (!check) {
			 		return false;
			 	}
			}

			return true;
		} else {
			return false;
		}
	};
}

export function createDOMAttributesMatcher(attributes: any) {
	const keys = Object.keys(attributes);
	const length = keys.length;

	if (attributes.hasOwnProperty('style')) {
		attributes.style = createDOMStyleMatcher(attributes.style);
	}

	return function attributesMatcher(node: Element): boolean {
		if (length) {
			let idx = length;

			 while (idx--) {
			 	const key = keys[idx];
			 	const value = attributes[key];
			 	let check = true;

			 	if (key === 'style') {
					check = value((<HTMLElement>node).style);
			 	} else if (value === '*'){
					check = node.hasAttribute(key);
			 	} else {
			 		check = value === node.getAttribute(key);
			 	}

			 	if (!check) {
			 		return false;
			 	}
			 }

			 return true;
		} else {
			return true;
		}
	}
}

export function createDOMMatcher(tagName: string, attributes?: any) {
	const attributesMatcher = attributes ? createDOMAttributesMatcher(attributes) : () => true;

	return function domMatcher(node: Element): boolean {
		if (tagName === '*' || isNode(node, tagName)) {
			return attributesMatcher(node);
		}

		return false;
	};
}
