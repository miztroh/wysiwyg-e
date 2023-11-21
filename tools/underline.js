import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './underline.mjs';

class WysiwygToolUnderline extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Underline': 'Sublinhado'
			},
			'en': {
				'Underline': 'Underline'
			},
			'fr': {
				'Underline': 'Souligner'
			},
			'de': {
				'Underline': 'Unterstreichen'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {};
		this.keys[`${this.modifier.key}+u`] = this.underline;
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.underline}"><md-icon>format_underlined</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Underline')} (${this.modifier.tooltip} + U)</wysiwyg-tooltip>
		`;
	}

	underline() {
		if (this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('underline');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('underline');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('underline');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-underline', WysiwygToolUnderline);