import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './clear.mjs';

class WysiwygToolClear extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Clear Formatting': 'Limpar a formatação'
			},
			'en': {
				'Clear Formatting': 'Clear Formatting'
			},
			'fr': {
				'Clear Formatting': 'Supprimer la mise en forme'
			},
			'de': {
				'Clear Formatting': 'Format entfernen'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'ctrl+space': this.clear
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.clear}"><md-icon>format_clear</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Clear Formatting')} (Ctrl + Space)</wysiwyg-tooltip>
		`;
	}

	clear() {
		if (this.disabled) return false;
		document.execCommand('removeFormat');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('removeFormat');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('removeFormat');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-clear', WysiwygToolClear);