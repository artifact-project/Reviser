import {createSimpleExtension} from '../extension';
import {KEY_ENTER} from '../../pen-box/keys';
import enter from '../../pen-box/enter';

export default createSimpleExtension(KEY_ENTER, (evt, range, selection, {container}) => {
	enter(range, container);
});
