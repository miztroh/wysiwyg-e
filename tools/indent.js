import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './indent.mjs';

class WysiwygToolIndent extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Indent': 'Recuar'
			},
			'en': {
				'Indent': 'Indent'
			},
			'fr': {
				'Indent': 'Augmenter le retrait'
			},
			'de': {
				'Indent': 'Einrücken'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'tab': this.indent
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.indent}"><md-icon>format_indent_increase</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Indent')} (Tab)</wysiwyg-tooltip>
		`;
	}

	indent(event, detail) {
		if ((detail && detail.keyboardEvent.shiftKey) || this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('indent');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('indent');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('indent');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-indent', WysiwygToolIndent);