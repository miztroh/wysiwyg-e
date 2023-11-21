import { html } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/button/text-button.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES } from './justify.mjs';

class WysiwygToolJustify extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Justify': 'Justificar',
				'Left': 'Esquerda',
				'Right': 'Direita',
				'Center': 'Centro',
				'Full': 'Inteiro'
			},
			'en': {
				'Justify': 'Justify',
				'Left': 'Left',
				'Right': 'Right',
				'Center': 'Center',
				'Full': 'Full'
			},
			'fr': {
				'Justify': 'Justifier',
				'Left': 'Gauche',
				'Right': 'Droite',
				'Center': 'Centrer',
				'Full': 'Entier'
			},
			'de': {
				'Justify': 'Anordnung',
				'Left': 'Links',
				'Right': 'Rechts',
				'Center': 'Zentriert',
				'Full': 'Ganze Breite'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {};

		this.keys[`${this.modifier.key}+left`] = () => {
			this.justify({target: {selected: {value: 'left'}}});
		};

		this.keys[`${this.modifier.key}+right`] = () => {
			this.justify({target: {selected: {value: 'right'}}});
		};

		this.keys[`${this.modifier.key}+up`] = () => {
			this.justify({target: {selected: {value: 'center'}}});
		};

		this.keys[`${this.modifier.key}+down`] = () => {
			this.justify({target: {selected: {value: 'full'}}});
		};
	}

	render () {
		return html`
			<md-filled-icon-button id="button" .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>format_align_justify</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Justify')} (Shift + Alt + C)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.justify}">
				<div slot="headline">${this.localize('Justify')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-select id="justifications" label="Justification" required menu-positioning="fixed">
						<md-select-option></md-select-option>
						<md-select-option value="left"><div slot="headline">${this.localize('Left')}</div></md-select-option>
						<md-select-option value="right"><div slot="headline">${this.localize('Right')}</div></md-select-option>
						<md-select-option value="center"><div slot="headline">${this.localize('Center')}</div></md-select-option>
						<md-select-option value="full"><div slot="headline">${this.localize('Full')}</div></md-select-option>
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

	justify (e) {
		if (!this.shadowRoot.getElementById('justifications').checkValidity()) {
			e.stopPropagation();
			this.shadowRoot.getElementById('justifications').focus();
			return;
		}

		const justification = this.shadowRoot.getElementById('justifications').value;
		this.closeDialog();
		this.shadowRoot.getElementById('justifications').value = null;
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		if (returnValue !== 'save' || this.disabled || !this.selection || !this.selection.range0 || !['left', 'right', 'center', 'full'].includes(justification)) return;
		const command = 'justify' + justification.charAt(0).toUpperCase() + justification.slice(1);

		if (document.queryCommandState(command)) {
			document.execCommand('justifyLeft');
		} else {
			document.execCommand(command);
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

	updated (props) {
		super.updated();

		if (props.has('selection')) {
			if (!this.selection || !this.selection.range0) {
				this.active = false;
				this.disabled = true;
			} else {
				let active = true, icon = 'format_align_left';

				if (document.queryCommandState('justifyRight')) {
					icon = 'format_align_right';
				} else if (document.queryCommandState('justifyCenter')) {
					icon = 'format_align_center';
				} else if (document.queryCommandState('justifyFull')) {
					icon = 'format_align_justify';
				} else {
					active = false;
				}
	
				this.active = active;
				this.shadowRoot.getElementById('button').icon = icon;
				this.disabled = !(document.queryCommandEnabled('justifyLeft') || document.queryCommandEnabled('justifyRight') || document.queryCommandEnabled('justifyCenter') || document.queryCommandEnabled('justifyFull'));
			}
		}
	}
}

customElements.define('wysiwyg-tool-justify', WysiwygToolJustify);