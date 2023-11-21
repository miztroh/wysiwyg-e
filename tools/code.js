import { html } from 'lit';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './code.mjs';

class WysiwygToolCode extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Code': 'Código'
			},
			'en': {
				'Code': 'Code'
			},
			'fr': {
				'Code': 'Code'
			},
			'de': {
				'Code': 'Code'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+k': this.code
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.code}"><md-icon>code</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Code')} (Shift + Ctrl + K)</wysiwyg-tooltip>
		`;
	}

	keysPressed () {
		this.code();
	}

	code() {
		if (this.disabled) return;

		if (!this.active) {
			var rangeText = this.selection.range0.toString();
			var code = document.createElement('code');
			this.selection.range0.surroundContents(code);
			if (!rangeText) code.innerHTML = '<br>';
		} else  {
			var path = this.selection.commonAncestorPath;

			if (path) {
				for (var i = 0; i < path.length - 1; i += 1) {
					if (path[i].tagName === 'CODE') {
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
					if (path[i].tagName === 'CODE') {
						active = true;
						break;
					}
				}
			}

			this.active = active;
			this.disabled = !(this.selection && this.selection.range0);
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-code', WysiwygToolCode);