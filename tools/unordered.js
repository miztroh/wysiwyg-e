import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './unordered.mjs';

class WysiwygToolUnordered extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Unordered List': 'Lista não ordenada'
			},
			'en': {
				'Unordered List': 'Unordered List'
			},
			'fr': {
				'Unordered List': 'Liste non-ordonnée'
			},
			'de': {
				'Unordered List': 'Ungeordnete Liste'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+u': this.unordered
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.unordered}"><md-icon>format_list_bulleted</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Unordered List')} (Shift + Ctrl + U)</wysiwyg-tooltip>
		`;
	}

	unordered() {
		if (this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('insertUnorderedList');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('insertUnorderedList');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('insertUnorderedList');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-unordered', WysiwygToolUnordered);