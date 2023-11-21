import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES } from './outdent.mjs';

class WysiwygToolOutdent extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Outdent': 'Diminuir a indentação'
			},
			'en': {
				'Outdent': 'Outdent'
			},
			'fr': {
				'Outdent': 'Diminuer le retrait'
			},
			'de': {
				'Outdent': 'Ausrücken'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+tab': this.outdent
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.outdent}"><md-icon>format_indent_decrease</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Outdent')} (Shift + Tab)</wysiwyg-tooltip>
		`;
	}

	outdent(event, detail) {
		if ((detail && !detail.keyboardEvent.shiftKey) || this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('outdent');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('outdent');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('outdent');
			}
		}
	}
}

customElements.define('wysiwyg-tool-outdent', WysiwygToolOutdent);