import { html } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './video.mjs';

class WysiwygToolVideo extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Video': 'Vídeo',
				'URL': 'URL'
			},
			'en': {
				'Video': 'Video',
				'URL': 'URL'
			},
			'fr': {
				'Video': 'Vidéo',
				'URL': 'URL'
			},
			'de': {
				'Video': 'Video',
				'URL': 'URL'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+v': this.openDialog
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>movie</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Video')} (Shift + Ctrl + V)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.video}">
				<div slot="headline">${this.localize('Video')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-text-field id="url" label="${this.localize('URL')}" type="url"></md-filled-text-field>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="remove" ?hidden="${!this.selectedVideo}">Remove</md-text-button>
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	video (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const videoUrl = this.shadowRoot.getElementById('url').value;
		this.closeDialog();
		if (this.disabled) return;

		switch (returnValue) {
			case 'save':
				if (this.selectedVideo) {
					this.selectedVideo.src = videoUrl;
				} else {
					document.execCommand(
						'insertHTML',
						false,
						`<video-wrapper><video src="${videoUrl}" controls></video></video-wrapper>`
					);
				}

				break;
			case 'remove':
				if (this.selectedVideo) {
					this.selectedVideo.parentNode.parentNode.removeChild(this.selectedVideo.parentNode);
				}

				break;
		}
	}

	closeDialog () {
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
			selectedVideo: {
				type: HTMLVideoElement
			}
		};
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			let selectedVideo = null;

			if (this.selection && this.selection.commonAncestorPath) {
				for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (this.selection.commonAncestorPath[i].nodeType === HTMLElement.ELEMENT_NODE) {
						selectedVideo = this.selection.commonAncestorPath[i].querySelector('video');
						break;
					}
				}
			}

			this.selectedVideo = selectedVideo;
		}

		if (props.has('selectedVideo')) {
			if (this.selectedVideo) {
				this.shadowRoot.getElementById('url').value = this.selectedVideo.src;
			} else {
				this.shadowRoot.getElementById('url').value = '';
			}
		}

		if (props.has('selection') || props.has('selectedVideo')) {
			this.active = !!this.selectedVideo;

			if (this.selectedVideo || (this.selection && this.selection.range0)) {
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

customElements.define('wysiwyg-tool-video', WysiwygToolVideo);