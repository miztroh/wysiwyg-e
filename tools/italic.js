import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES } from './italic.mjs';

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

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

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