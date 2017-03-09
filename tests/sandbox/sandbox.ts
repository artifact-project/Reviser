import Reviser, {CARET_AT_END} from "../../reviser";
import bootstrapViewFactory from "../../views/bootstrap";
import reviserExtensionBasePack from "../../extensions/base-pack";

const container = document.getElementById('root');
const reviser = new Reviser(container, {
	view: bootstrapViewFactory({height: '60vh'}),
	extensions: reviserExtensionBasePack,
	defaultCaretPosition: CARET_AT_END,
});

reviser.content = 'x<div></div>y <b>http</b>://mail.ru';
reviser.focus();
