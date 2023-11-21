import { html, css } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/button/filled-button.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './code.mjs';

class WysiwygToolColor extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Color': 'Cor'
			},
			'en': {
				'Color': 'Color'
			},
			'fr': {
				'Color': 'Couleur'
			},
			'de': {
				'Color': 'Farbe'
			}
		};


		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.selectedColor = '#000000';

		this.colors = [
			'#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336',
			'#e53935', '#d32f2f', '#c62828', '#b71c1c', '#fce4ec', '#f8bbd0',
			'#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b',
			'#ad1457', '#880e4f', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8',
			'#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c',
			'#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7',
			'#5e35b1', '#512da8', '#4527a0', '#311b92', '#e8eaf6', '#c5cae9',
			'#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f',
			'#283593', '#1a237e', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6',
			'#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1',
			'#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4',
			'#039be5', '#0288d1', '#0277bd', '#01579b', '#e0f7fa', '#b2ebf2',
			'#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7',
			'#00838f', '#006064', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac',
			'#26a69a', '#009688', '#00897b', '#00796b', '#00695c', '#004d40',
			'#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50',
			'#43a047', '#388e3c', '#2e7d32', '#1b5e20', '#f1f8e9', '#dcedc8',
			'#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38',
			'#558b2f', '#33691e', '#f9fbe7', '#f0f4c3', '#e6ee9c', '#dce775',
			'#d4e157', '#cddc39', '#c0ca33', '#afb42b', '#9e9d24', '#827717',
			'#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b',
			'#fdd835', '#fbc02d', '#f9a825', '#f57f17', '#fff8e1', '#ffecb3',
			'#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffb300', '#ffa000',
			'#ff8f00', '#ff6f00', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d',
			'#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100',
			'#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722',
			'#f4511e', '#e64a19', '#d84315', '#bf360c', '#efebe9', '#d7ccc8',
			'#bcaaa4', '#a1887f', '#8d6e63', '#795548', '#6d4c41', '#5d4037',
			'#4e342e', '#3e2723', '#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0',
			'#bdbdbd', '#9e9e9e', '#757575', '#616161', '#424242', '#212121'
		];

		this.keys = {
			'shift+ctrl+c': this.openDialog
		};
	}

	static get properties () {
		return {
			selectedColor: { type: String },
			colors: { type: Array }
		};
	}

	static get styles () {
		return [
			super.styles,
			css`
				#colors {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
				}

				#colors .color {
					width: 48px;
					height: 48px;
				}

				#colors .color:focus-within {
					border: 2px solid black;
					margin: -2px;
					z-index: 1;
				}
			`
		]
	}

	render () {
		return html`
			<md-filled-icon-button id="button" .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>format_paint</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Color')} (Shift + Ctrl + C)</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.color}">
				<div slot="headline">${this.localize('Color')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-list id="colors">
						${
							this.colors.map(
								color => html`
									<md-list-item class="color" headline="${color}" style="background: ${color};" @click="${ (e) => { this.selectedColor = color; console.log(this.selectedColor); } }"></md-list-item>
								`
							)
						}
					</md-list>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="remove" ?hidden="${!this.selectedAudio}">Remove</md-text-button>
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	color (e) {
		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const selectedColor = this.selectedColor;
		this.closeDialog();
		this.selectedColor = '#000000';
		if (returnValue !== 'save' || this.disabled) return;
		document.execCommand('styleWithCSS', false, true);

		setTimeout(
			() => {
				// Set the color on the current selection
				document.execCommand('foreColor', false, selectedColor);

				setTimeout(
					() => {
						// Revert to styleWithCSS default
						document.execCommand('styleWithCSS', false, false);
					},
					1000
				);
			},
			10
		);
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
				try {
					this.active = document.queryCommandState('foreColor');
				} catch (ignore) {
					this.active = false;
				}

				this.disabled = !document.queryCommandEnabled('foreColor');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-color', WysiwygToolColor);