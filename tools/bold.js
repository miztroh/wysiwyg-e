import { html } from 'lit';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES } from './bold.mjs';

class WysiwygToolBold extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Bold': 'Negrito'
			},
			'en': {
				'Bold': 'Bold'
			},
			'fr': {
				'Bold': 'Gras'
			},
			'de': {
				'Bold': 'Fett'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;
		this.keys = {};
		this.keys[`${this.modifier.key}+b`] = this.bold;
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.bold}"><md-icon>format_bold</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Bold')} (${this.modifier.tooltip} + B)</wysiwyg-tooltip>
		`;
	}

	bold () {
		if (this.disabled) return false;
		document.execCommand('bold');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('bold');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('bold');
			}
		}
	}
}

customElements.define('wysiwyg-tool-bold', WysiwygToolBold);