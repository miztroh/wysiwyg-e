import { html } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './image.mjs';

class WysiwygToolImage extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Image': 'Imagem',
				'URL': 'URL',
				'Float': 'Flutuador',
				'none': 'nenhum',
				'left': 'esquerda',
				'right': 'direita'
			},
			'en': {
				'Image': 'Image',
				'URL': 'URL',
				'Float': 'Float',
				'none': 'none',
				'left': 'left',
				'right': 'right'
			},
			'fr': {
				'Image': 'Image',
				'URL': 'URL',
				'Float': 'Flottant',
				'none': 'aucun',
				'left': 'gauche',
				'right': 'droite'
			},
			'de': {
				'Image': 'Bild',
				'URL': 'URL',
				'Float': 'Verschiebung',
				'none': 'keins',
				'left': 'links',
				'right': 'rechts'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+m': this.openDialog
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>image</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Image')} (Shift + Ctrl + M)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.image}">
				<div slot="headline">${this.localize('Image')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-text-field id="url" label="${this.localize('URL')}" type="url"></md-filled-text-field>
					<md-filled-select id="float" label="${this.localize('Float')}" menu-positioning="fixed">
						<md-select-option value="none"><div slot="headline">${this.localize('none')}</div></md-select-option>
						<md-select-option value="left"><div slot="headline">${this.localize('left')}</div></md-select-option>
						<md-select-option value="right"><div slot="headline">${this.localize('right')}</div></md-select-option>
					</md-filled-select>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="remove" ?hidden="${!this.selectedImage}">Remove</md-text-button>
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	image (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const imageUrl = this.shadowRoot.getElementById('url').value;
		const imageFloat = this.shadowRoot.getElementById('float').value;
		this.closeDialog();
		if (this.disabled) return;

		switch (returnValue) {
			case 'save':
				if (this.selectedImage) {
					this.selectedImage.src = imageUrl;
					this.selectedImage.style.float = imageFloat;
				} else {
					document.execCommand('insertImage', false, imageUrl);

					setTimeout(
						() => {
							if (this.selectedImage) this.selectedImage.style.float = imageFloat;
						},
						500
					);
				}

				break;
			case 'remove':
				if (this.selectedImage) {
					this.dispatchEvent(
						new CustomEvent(
							'selectElement',
							{
								bubbles: true,
								composed: true,
								detail: {
									element: this.selectedImage
								}
							}
						)
					);

					setTimeout(
						() => {
							document.execCommand('delete');
						},
						50
					);
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
			selectedImage: {
				type: HTMLImageElement
			}
		};
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			let selectedImage = null;

			if (this.selection && this.selection.commonAncestorPath) {
				for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (this.selection.commonAncestorPath[i].nodeType === HTMLElement.ELEMENT_NODE) {
						selectedImage = this.selection.commonAncestorPath[i].querySelector('img');
						break;
					}
				}
			}

			this.selectedImage = selectedImage;
		}

		if (props.has('selectedImage')) {
			if (this.selectedImage) {
				this.shadowRoot.getElementById('url').value = this.selectedImage.src;
				this.shadowRoot.getElementById('float').value = this.selectedImage.style.float || 'none';
			} else {
				this.shadowRoot.getElementById('url').value = '';
				this.shadowRoot.getElementById('float').value = 'none';
			}
		}

		if (props.has('selection') || props.has('selectedImage')) {
			this.active = !!this.selectedImage;

			if (this.selectedImage || (this.selection && this.selection.range0)) {
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

customElements.define('wysiwyg-tool-image', WysiwygToolImage);