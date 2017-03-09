import {createSimpleExtension} from '../extension';
import {KEY_BACKSPACE} from '../../pen-box/keys';
import backspace from '../../pen-box/backspace';

export default createSimpleExtension(KEY_BACKSPACE, (evt, range, selection, {container}) => {
	backspace(range, container);
});

