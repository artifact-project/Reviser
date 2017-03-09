import zwsFactory from './zws/zws';
import linkFactory from './link/link';
import enterFactory from './enter/enter';
import backspaceFactory from './backspace/backspace';
import baseStyleFactory from './base-style/base-style';

export default [
	zwsFactory(),
	linkFactory(),
	enterFactory(),
	backspaceFactory(),
	baseStyleFactory({bold: true, italic: true, underline: true}),
];
