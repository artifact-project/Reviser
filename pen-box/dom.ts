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
					cssText += `${key}: ${style[key]};`
				}
			}
		}
	}

	return cssText;
}

export function createElement(name: string, attributes?: {[index: string]: any}): HTMLElement {
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

export function listenFrom(container: HTMLElement, eventName: string, attr: string, handle: (action: string, target: HTMLElement, evt: Event) => void) {
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

	container.addEventListener(eventName, handleEvent, false);

	return function dispose() {
		container.removeEventListener(eventName, handleEvent, false);
	};
}


export function createTextNode(value: string = ''): Text {
	return document.createTextNode(value);
}

export function isNode(node: Node, name?: string): boolean {
	return node ? node.nodeType > 0 && (name == null || name.toLowerCase() === node.nodeName.toLowerCase()) : false;
}

export function isTextNode(node: Node): node is Text {
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

export function closest(node: Node, matcher: string | IDOMMatcher): HTMLElement | null {
	if (typeof matcher === 'string') {
		matcher = createDOMMatcher(matcher);
	}

	while (node && node !== document) {
		if (matcher.test(node)) {
			return <HTMLElement>node;
		}

		node = node.parentNode;
	}

	return null;
}

export function isSelfClosedElement(node: Node): boolean {
	return node ? SELF_CLOSED.hasOwnProperty(node.nodeName.toLowerCase()) : false;
}

export function isInlineElement(node: Node): boolean {
	return node ? (INLINE_NODE.hasOwnProperty(node.nodeName.toLowerCase()) || isTextNode(node)) : false;
}

export function isBlockElement(node: Node, style?: CSSStyleDeclaration): boolean {
	if (node && !isTextNode(node)) {
		style = style || window.getComputedStyle(<Element>node);
		return (style.display && style.display !== 'auto') ? style.display === 'block' : !isInlineElement(node);
	} else {
		return false;
	}
}

export function isZeroSizeElement(node: Node, style?: CSSStyleDeclaration): boolean {
	if (node) {
		style = style || window.getComputedStyle(<Element>node);

		return (
			(style.display === 'none') || !(
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

export function unwrap(target: Element, newParent?: Element, removeOldParent: boolean = true): [Node, Node] {
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

	removeOldParent && parent.removeChild(target);

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

export function getMaxDeepNode(node: Node, offset: number | 'max', type: 'start' | 'end'): [Node, number] {
	if (isTextNode(node) || isSelfClosedElement(node)) {
		return [node, offset === 'max' ? getNodeLength(node) : offset];
	} else {
		let nextNode: Node;

		if (offset === 'max') {
			nextNode = node.lastChild;
		} else {
			nextNode = offset ? node.childNodes[offset] || node.childNodes[offset - 1] : node.firstChild || node
		}

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
	[index: string]: string;
}

export function normalizeNodes(start: Node, end: Node, replace?: NormalizeReplaceMap) {
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

export function cloneNode<T extends Node>(node: Node, deep?: boolean): T {
	return <T>node.cloneNode(deep);
}

interface IMatcher<A, T> {
	keys: string[];
	length: number;
	attributes: A;
	test: (attributes: T) => boolean;
}

export interface IDOMStyleMatcher extends IMatcher<any, CSSStyleDeclaration> {
	// equal: (style: CSSStyleDeclaration) => boolean;
}

export interface IDOMAttributesMatcher extends IMatcher<any, Element> {
	styleMatcher: IDOMStyleMatcher;
}

export interface IDOMMatcher {
	tagName: string;
	attributes: any;
	attributesMatcher: IDOMAttributesMatcher;
	styleMatcher: IDOMStyleMatcher;
	test: (node: Node) => boolean;
}

export function createDOMStyleMatcher(attributes: any, anyValue?: boolean): IDOMStyleMatcher {
	const keys = Object.keys(attributes);
	const length = keys.length;

	return {
		keys,
		length,
		attributes,

		test: function styleMatcher(elementStyle: CSSStyleDeclaration) {
			if (length) {
				let idx = length;

				while (idx--) {
					const key = keys[idx];
					const value = attributes[key];
					const actualValue = elementStyle.getPropertyValue(key);
					let check = true;

					if (value === '*' || anyValue) {
						check = !!actualValue;
					} else {
						check = value === actualValue
					}

					if (!check) {
						return false;
					}
				}

			}

			return true;
		}
	};
}

const emptyStyleMatcher = createDOMStyleMatcher({});

export function createDOMAttributesMatcher(attributes: any, anyValue?: boolean): IDOMAttributesMatcher {
	const keys = Object.keys(attributes);
	const length = keys.length;
	let styleMatcher = attributes.style ? createDOMStyleMatcher(attributes.style, anyValue) : emptyStyleMatcher;

	return {
		keys,
		length,
		attributes,
		styleMatcher,

		test: function attributesMatcher(node: Element): boolean {
			if (length) {
				let idx = length;

				while (idx--) {
					const key = keys[idx];
					const value = attributes[key];
					let check = true;

					if (key === 'style') {
						check = styleMatcher.test((<HTMLElement>node).style);
					} else if (value === '*' || anyValue) {
						check = node.hasAttribute(key);
					} else {
						check = value === node.getAttribute(key);
					}

					if (!check) {
						return false;
					}
				}
			}

			return true;
		}
	};
}

const emptyDOMAttributesMatcher = createDOMAttributesMatcher({});

export function createDOMMatcher(tagName: string, attributes?: any, anyValue?: boolean): IDOMMatcher {
	const attributesMatcher = attributes ? createDOMAttributesMatcher(attributes, anyValue) : emptyDOMAttributesMatcher;

	return {
		tagName,
		attributes,

		attributesMatcher,
		styleMatcher: attributesMatcher.styleMatcher,

		test: function domMatcher(node: Node): boolean {
			if (node && (tagName === '*' && !isTextNode(node) || isNode(node, tagName))) {
				return attributesMatcher.test(<Element>node);
			}

			return false;
		}
	};
}
