import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';

class WysiwygToolStrike extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Strikethrough': 'Tachado'
			},
			'en': {
				'Strikethrough': 'Strikethrough'
			},
			'fr': {
				'Strikethrough': 'Barrer'
			},
			'de': {
				'Strikethrough': 'Durchgestrichen'
			}
		};

		this.allowedTagNames = ['S'];

		this.replacementTagNames = {
			'STRIKE': 'S'
		};

		this.keys = {
			'shift+ctrl+d': this.strike
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.strike}"><md-icon>format_strikethrough</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Strikethrough')} (Shift + Ctrl + D)</wysiwyg-tooltip>
		`;
	}

	strike() {
		if (this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('strikeThrough');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('strikeThrough');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('strikeThrough');
			}
		}
	}
}

customElements.define('wysiwyg-tool-strike', WysiwygToolStrike);