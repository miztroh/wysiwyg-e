import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';

class WysiwygToolOrdered extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Ordered List': 'Lista ordenada'
			},
			'en': {
				'Ordered List': 'Ordered List'
			},
			'fr': {
				'Ordered List': 'Liste ordonnée'
			},
			'de': {
				'Ordered List': 'Geordnete Liste'
			}
		};

		this.allowedTagNames = ['OL', 'LI'];

		this.keys = {
			'shift+ctrl+o': this.ordered
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.ordered}"><md-icon>format_list_numbered</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Ordered List')} (Shift + Ctrl + O)</wysiwyg-tooltip>
		`;
	}

	ordered() {
		if (this.disabled || !this.selection || !this.selection.range0) return false;
		document.execCommand('insertOrderedList');
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				try {
					this.active = document.queryCommandState('insertOrderedList');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('insertOrderedList');
			}
		}
	}
}

customElements.define('wysiwyg-tool-ordered', WysiwygToolOrdered);