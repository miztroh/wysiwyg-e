import { html } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/button/filled-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/filled-text-field.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './link.mjs';

class WysiwygToolLink extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Link': 'Link',
				'URL': 'URL',
				'Target': 'Alvo'
			},
			'en': {
				'Link': 'Link',
				'URL': 'URL',
				'Target': 'Target'
			},
			'fr': {
				'Link': 'Lien',
				'URL': 'URL',
				'Target': 'Cible'
			},
			'de': {
				'Link': 'Link',
				'URL': 'URL',
				'Target': 'Ziel'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'shift+ctrl+a': this.openDialog
		};
	}

	render () {
		return html`
			<md-filled-icon-button .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>link</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Link')} (Shift + Ctrl + A)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.link}">
				<div slot="headline">${this.localize('Link')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-text-field id="url" label="${this.localize('URL')}" type="url"></md-filled-text-field>
					<md-filled-select id="target" label="${this.localize('Target')}" menu-positioning="fixed">
						<md-select-option value="_blank"><div slot="headline">_blank</div></md-select-option>
						<md-select-option value="_self"><div slot="headline">_self</div></md-select-option>
						<md-select-option value="_parent"><div slot="headline">_parent</div></md-select-option>
						<md-select-option value="_top"><div slot="headline">_top</div></md-select-option>
					</md-filled-select>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="remove" ?hidden="${!this.selectedLink}">Remove</md-text-button>
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	link (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const linkUrl = this.shadowRoot.getElementById('url').value;
		const linkTarget = this.shadowRoot.getElementById('target').value;
		this.closeDialog();
		if (this.disabled) return;

		switch (returnValue) {
			case 'save':
				if (this.selectedLink) {
					this.selectedLink.href = linkUrl;
					this.selectedLink.target = linkTarget;
				} else {
					document.execCommand('createLink', false, linkUrl);

					setTimeout(
						() => {
							if (this.selectedLink) this.selectedLink.target = linkTarget;
						},
						500
					);
				}

				break;
			case 'remove':
				if (this.selectedLink) {
					this.dispatchEvent(
						new CustomEvent(
							'selectElement',
							{
								bubbles: true,
								composed: true,
								detail: {
									element: this.selectedLink
								}
							}
						)
					);

					setTimeout(
						() => {
							document.execCommand('unlink');
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
			selectedLink: {
				type: HTMLAnchorElement
			}
		};
	}

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			let selectedLink = null;

			if (this.selection && this.selection.commonAncestorPath) {
				for (var i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (this.selection.commonAncestorPath[i].tagName === 'A') {
						selectedLink = this.selection.commonAncestorPath[i];
						break;
					}
				}
			}

			this.selectedLink = selectedLink;
		}

		if (props.has('selectedLink')) {
			if (this.selectedLink) {
				this.shadowRoot.getElementById('url').value = this.selectedLink.href;
				this.shadowRoot.getElementById('target').value = this.selectedLink.target || '_self';
			} else {
				this.shadowRoot.getElementById('url').value = '';
				this.shadowRoot.getElementById('target').value = '_self';
			}
		}

		if (props.has('selection') || props.has('selectedLink')) {
			this.active = !!this.selectedLink;

			if (this.selectedLink) {
				this.disabled = false;
			} else if (!this.selection || !this.selection.range0) {
				this.disabled = true;
			} else {
				this.disabled = !(this.selection.range0.startContainer !== this.selection.range0.endContainer || this.selection.range0.endOffset > this.selection.range0.startOffset);
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-link', WysiwygToolLink);