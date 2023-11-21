import { html, css } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/text-button.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './audio.mjs';

class WysiwygToolAudio extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Audio': 'Áudio',
				'URL': 'URL'
			},
			'en': {
				'Audio': 'Audio',
				'URL': 'URL'
			},
			'fr': {
				'Audio': 'Audio',
				'URL': 'URL'
			},			
			'de': {
				'Audio': 'Audio',
				'URL': 'URL'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+s': this.openDialog
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>audiotrack</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Audio')} (Shift + Ctrl + S)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.audio}">
				<div slot="headline">${this.localize('Audio')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-text-field id="url" label="${this.localize('URL')}" type="url"></md-filled-text-field>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="remove" ?hidden="${!this.selectedAudio}">Remove</md-text-button>
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	audio (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const audioUrl = this.shadowRoot.getElementById('url').value;
		this.closeDialog();
		if (this.disabled) return;

		switch (returnValue) {
			case 'save':
				if (this.selectedAudio) {
					this.selectedAudio.src = audioUrl;
				} else {
					document.execCommand(
						'insertHTML',
						false,
						`<audio-wrapper><audio src="${audioUrl}" controls></audio></audio-wrapper>`
					);
				}

				break;
			case 'remove':
				if (this.selectedAudio) {
					this.selectedAudio.parentNode.parentNode.removeChild(this.selectedAudio.parentNode);
				}

				break;
		}
	}

	closeDialog () {
		if (this.disabled) return;
		this.shadowRoot.getElementById('dialog').open = false;
		this.dispatchEvent(new CustomEvent('restoreSelection', {bubbles: true, composed: true, detail: { selection: this._savedSelection}}));
		delete this._savedSelection;
	}

	openDialog () {
		if (this.disabled) return;

		this._savedSelection = {
			start: this._getNodeOffset(this.target, this.selection.range0.startContainer) + this._totalOffsets(this.selection.range0.startContainer, this.selection.range0.startOffset),
			end: this._getNodeOffset(this.target, this.selection.range0.endContainer) + this._totalOffsets(this.selection.range0.endContainer, this.selection.range0.endOffset)
		};

		this.shadowRoot.getElementById('dialog').open = true;
	}

	static get properties() {
		return {
			selectedAudio: {
				type: HTMLAudioElement
			}
		};
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			let selectedAudio = null;

			if (this.selection && this.selection.commonAncestorPath) {
				for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (this.selection.commonAncestorPath[i].nodeType === HTMLElement.ELEMENT_NODE) {
						selectedAudio = this.selection.commonAncestorPath[i].querySelector('audio');
						break;
					}
				}
			}

			this.selectedAudio = selectedAudio;
		}

		if (props.has('selectedAudio')) {
			if (this.selectedAudio) {
				this.shadowRoot.getElementById('url').value = this.selectedAudio.src;
			} else {
				this.shadowRoot.getElementById('url').value = '';
			}
		}

		if (props.has('selection') || props.has('selectedAudio')) {
			this.active = !!this.selectedAudio;

			if (this.selectedAudio || (this.selection && this.selection.range0)) {
				this.disabled = false;
			} else {
				this.disabled = true;
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-audio', WysiwygToolAudio);