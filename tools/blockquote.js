import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';

class WysiwygToolBlockquote extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Blockquote': 'Citação'
			},
			'en': {
				'Blockquote': 'Blockquote'
			},
			'fr': {
				'Blockquote': 'Citation'
			},
			'de': {
				'Blockquote': 'Blockquote'
			}
		};

		this.allowedTagNames = ['BLOCKQUOTE'];

		this.keys = {
			'shift+ctrl+q': this.blockquote
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.blockquote}"><md-icon>format_quote</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Blockquote')} (Shift + Ctrl + Q)</wysiwyg-tooltip>
		`;
	}

	blockquote () {
		if (this.disabled) return;

		if (!this.active) {
			var rangeText = this.selection.range0.toString();
			var blockquote = document.createElement('blockquote');
			blockquote.setAttribute('blockquote', '');
			this.selection.range0.surroundContents(blockquote);
			if (!rangeText) blockquote.innerHTML = '<br>';
		} else  {
			var path = this.selection.commonAncestorPath;

			if (path) {
				for (var i = 0; i < path.length - 1; i += 1) {
					if (path[i].tagName === 'BLOCKQUOTE' && path[i].hasAttribute('blockquote')) {
						path[i].outerHTML = path[i].innerHTML;
					}
				}
			}
		}
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			const path = this.selection ? this.selection.commonAncestorPath : null;
			let active = false;
			
			if (path) {
				for (var i = 0; i < path.length; i += 1) {
					if (path[i].tagName === 'BLOCKQUOTE' && path[i].hasAttribute('blockquote')) {
						active = true;
						break;
					}
				}
			}

			this.active = active;
			this.disabled = !(this.selection && this.selection.range0);
		}
	}
}

customElements.define('wysiwyg-tool-blockquote', WysiwygToolBlockquote);