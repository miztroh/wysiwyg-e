import { html } from 'lit';
import '@material/web/dialog/dialog.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/button/text-button.js';
import { WysiwygTool } from '../wysiwyg-tool.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '../wysiwyg-tooltip.js';
import { ALLOWED_STYLE_TYPES, ALLOWED_TAG_NAMES, REPLACEMENT_TAG_NAMES, SANITIZE } from './heading.mjs';

class WysiwygToolHeading extends WysiwygTool {
	constructor () {
		super();

		this.resources = {
			'br': {
				'Paragraph': 'Parágrafo',
				'Heading': 'Titulo'
			},
			'en': {
				'Paragraph': 'Paragraph',
				'Heading': 'Heading'
			},
			'fr': {
				'Paragraph': 'Paragraphe',
				'Heading': 'Titre'
			},
			'de': {
				'Paragraph': 'Paragraf',
				'Heading': 'Überschrift'
			}
		};

		this.allowedStyleTypes = ALLOWED_STYLE_TYPES;
		this.allowedTagNames = ALLOWED_TAG_NAMES;
		this.replacementTagNames = REPLACEMENT_TAG_NAMES;

		this.keys = {
			'ctrl+0': () => {
				this.heading({target: {selected: {value: 0}}});
			},
			'ctrl+1': () => {
				this.heading({target: {selected: {value: 1}}});
			},
			'ctrl+2': () => {
				this.heading({target: {selected: {value: 2}}});
			},
			'ctrl+3': () => {
				this.heading({target: {selected: {value: 3}}});
			},
			'ctrl+4': () => {
				this.heading({target: {selected: {value: 4}}});
			},
			'ctrl+5': () => {
				this.heading({target: {selected: {value: 5}}});
			},
			'ctrl+6': () => {
				this.heading({target: {selected: {value: 6}}});
			}
		}
	}

	render () {
		return html`
			<md-filled-icon-button id="button" .disabled="${this.disabled}" id="button" @click="${this.openDialog}"><md-icon>format_size</md-icon></md-filled-icon-button>
			<wysiwyg-tooltip id="tooltip" .for="${'button'}" .position="${this.tooltipPosition}">${this.localize('Heading')}</wysiwyg-tooltip>
			<md-dialog id="dialog" @closed="${this.heading}">
				<div slot="headline">${this.localize('Heading')}</div>
				<form slot="content" id="form" method="dialog" style="display: none;"></form>
				<div slot="content">
					<md-filled-select id="levels" label="Type" required menu-positioning="fixed">
						<md-select-option></md-select-option>
						<md-select-option value="0"><div slot="headline">${this.localize('Paragraph')}</div></md-select-option>
						<md-select-option value="1"><div slot="headline">${this.localize('Heading')} 1</div></md-select-option>
						<md-select-option value="2"><div slot="headline">${this.localize('Heading')} 2</div></md-select-option>
						<md-select-option value="3"><div slot="headline">${this.localize('Heading')} 3</div></md-select-option>
						<md-select-option value="4"><div slot="headline">${this.localize('Heading')} 4</div></md-select-option>
						<md-select-option value="5"><div slot="headline">${this.localize('Heading')} 5</div></md-select-option>
						<md-select-option value="6"><div slot="headline">${this.localize('Heading')} 6</div></md-select-option>
					</md-filled-select>
				</div>				
				<div slot="actions">
					<md-text-button form="form" value="save">Save</md-text-button>
					<md-text-button form="form" value="cancel">Cancel</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	heading (e) {
		if (!this.shadowRoot.getElementById('levels').checkValidity()) {
			e.stopPropagation();
			this.shadowRoot.getElementById('levels').focus();
			return;
		}

		const returnValue = this.shadowRoot.getElementById('dialog').returnValue;
		const level = +this.shadowRoot.getElementById('levels').value;
		this.closeDialog();
		this.shadowRoot.getElementById('levels').value = null;
		if (returnValue !== 'save' || this.disabled || !this.selection || !this.selection.range0 || !Number.isInteger(level) || level < 0 || level > 6) return;
		let heading;

		for (let i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
			if (['H' + level].indexOf(this.selection.commonAncestorPath[i].tagName) >= 0) {
				heading = true;
				break;
			}
		}

		if (heading || level === 0) {
			document.execCommand('formatBlock', null, 'P');
		} else {
			document.execCommand('formatBlock', null, 'H' + level);
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
				let active = true;

				for (let i = 0; i < this.selection.commonAncestorPath.length; i += 1) {
					if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(this.selection.commonAncestorPath[i].tagName)) {
						active = true;
						break;
					}
				}
	
				this.active = active;
				this.disabled = !document.queryCommandEnabled('formatBlock');
			}
		}
	}

	sanitize (node) {
		return SANITIZE(node);
	}
}

customElements.define('wysiwyg-tool-heading', WysiwygToolHeading);