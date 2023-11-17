import { css } from 'lit';
import { WysiwygBase } from './wysiwyg-base.js';

export class WysiwygTool extends WysiwygBase {
	static get styles () {
		return css`
			:host {
				display: block;
			}

			[hidden] {
				display: none!important;
			}

			md-dialog {
				--md-dialog-container-color: white;
			}

			md-filled-text-field,
			md-filled-select {
				width: 100%;
			}

			md-filled-text-field,
			md-filled-select,
			md-text-button,
			md-switch {
				--md-sys-color-primary: var(--wysiwyg-tool-theme, #2A9AF2);
			}

			md-select-option {
				--md-sys-color-secondary-container: rgba(42, 154, 242, 0.2);
			}
		
			label:has(md-switch) {
				line-height: 32px;
				display: block;
			}
		
			label > md-switch {
				margin-left: 20px;
			}

			md-filled-text-field + md-filled-select,
			md-filled-select + md-filled-text-field,
			md-filled-text-field + md-filled-text-field,
			md-filled-select + md-filled-select {
				margin-top: 20px;
			}

			md-text-button[value="remove"] {
				--md-sys-color-primary: red;
			}

			md-filled-icon-button {
				--md-filled-icon-button-container-shape: 0;
				--md-filled-icon-button-container-width: 48px;
				--md-filled-icon-button-container-height: 48px;
				--md-filled-icon-button-icon-size: 24px;
				--md-sys-color-primary: var(--wysiwyg-tool-theme, #2A9AF2);
			}

			:host([active]) md-filled-icon-button {
				--md-sys-color-primary: var(--wysiwyg-tool-icon-active-color, rgba(0, 0, 0, 0.5));
			}

			:host([disabled]) md-filled-icon-button {
				--md-sys-color-primary: var(--wysiwyg-tool-icon-disabled-color, rgba(255, 255, 255, 0.5));
			}
		`;
	}

	constructor() {
		super();
		this.active = false;
		this.disabled = false;
	}

	static get properties() {
		return {
			//
			// A boolean indicating whether the selection includes a node implemented by this tool
			//
			active: {
				type: Boolean,
				reflect: true
			},
			//
			// A boolean indicating whether the tool can be used with the selection
			//
			disabled: {
				type: Boolean,
				reflect: true
			}
		};
	}
}

customElements.define('wysiwyg-tool', WysiwygTool);