import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';

class WysiwygToolItalic extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Italic': 'Itálico'
			},
			'en': {
				'Italic': 'Italic'
			},
			'fr': {
				'Italic': 'Italique'
			},
			'de': {
				'Italic': 'Kursiv'
			}
		};

		this.allowedTagNames = ['I'];

		this.replacementTagNames = {
			'EM': 'I'
		};

		this.keys = {};
		this.keys[`${this.modifier.key}+i`] = this.italic;
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.italic}"><md-icon>format_italic</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Italic')} (${this.modifier.tooltip} + I)</wysiwyg-tooltip>
		`;
	}

	italic() {
		if (this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('italic');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('italic');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('italic');
			}
		}
	}
}

customElements.define('wysiwyg-tool-italic', WysiwygToolItalic);