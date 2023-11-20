import { html } from 'lit';
import { WysiwygBase } from './wysiwyg-base.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';
import { WysiwygTool } from './wysiwyg-tool.js';

export class WysiwygE extends WysiwygBase {
	keydown (e) {
		//Prevent default tab behavior
		if (e.key === 'Tab') this._tab(e);
		//Prevent default delete behavior
		if (e.key === 'Delete') this._delete(e);
		//Prevent default backspace behavior
		if (e.key === 'Backspace') this._backspace(e);
		//Allow input without alt, ctrl, or meta
		if (!e.altKey && !e.ctrlKey && !e.metaKey) return;
		//Allow select all, refresh, print, paste, copy, cut
		if (!e.altKey && !e.shiftKey && ['a', 'r', 'p', 'v', 'c', 'x'].indexOf(e.key) >= 0 && (e.ctrlKey || e.metaKey)) return;
		e.preventDefault();
	}

	firstUpdated () {
		this.target = this.shadowRoot.getElementById('editable');
		super.firstUpdated();

		setTimeout(
			function () {
				this.updateTools();
			}.bind(this),
			100
		);
	}

	updated (props) {
		super.updated(props);

		if (props.has('activeState')) {
			if (this.activeState !== +this.activeState.toFixed(0)) {
				this.activeState = +this.activeState.toFixed(0);
			} else if (this.activeState < 0) {
				this.activeState = 0;
			} else if (this.states.length && this.activeState > this.states.length - 1) {
				this.activeState = this.states.length - 1;
			} else if (typeof props.get('activeState') !== 'undefined' && this.target && this.target.innerHTML !== this.states[this.activeState].html) {
				this.target.innerHTML = this.states[this.activeState].html;
				this.restoreSelection();
			}
		}

		if (props.has('activeState') || props.has('states')) {
			this.canRedo = this.states && this.activeState < this.states.length - 1;
			this.canUndo = this.states && this.activeState > 0;
		}

		if (props.has('minWidth768px')) {
			this.scrollTop = 0;
			this.scrollLeft = 0;
		}

		if (props.has('minWidth768px') || props.has('forceNarrow') || props.has('scrollHeight') || props.has('scrollTop') || props.has('scrollWidth') || props.has('scrollLeft')) {
			this.canScrollNext = (this.minWidth768px && !this.forceNarrow) ? this.scrollLeft < this.scrollWidth : this.scrollTop < this.scrollHeight;
			this.canScrollPrevious = (this.minWidth768px && !this.forceNarrow) ? this.scrollLeft > 0 : this.scrollTop > 0;
		}

		if (props.has('mutationObserver')) {
			if (props.get('mutationObserver')) props.get('mutationObserver').disconnect();
			this.observe();
		}

		if (props.has('value')) {
			let showPlaceholder = false;

			if (this.target) {
				var div = document.createElement('div');
				div.innerHTML = this.value;
	
				if (!div.textContent.trim()) {
					showPlaceholder = true;
					var nodes = div.querySelectorAll('*');
	
					for (var i = 0; i < nodes.length; i += 1) {
						if (nodes[i].nodeType === Node.ELEMENT_NODE && !this.allowedTagNames.includes(nodes[i].tagName)) {
							showPlaceholder = false;
							break;
						}
					}
				}
			}
	
			this.showPlaceholder = showPlaceholder;

			if (this.target && (this.target.innerHTML || '') !== this.value) {
				this.target.innerHTML = this.value;
			}
		}

		if (props.has('target')) {
			this.disconnect();
			this.observe();
			if (!this.value) this.value = '';
			this.target.innerHTML = this.value;
		}

		if (props.has('canRedo') || props.has('canUndo') || props.has('value') || props.has('selection') || props.has('minWidth768px') || props.has('tooltipPosition') || props.has('forceNarrow') || props.has('language') || props.has('debug') || props.has('modifier')) {
			this.updateTools();
		}

		if (props.has('value')) {
			this.dispatchEvent(new CustomEvent('change', {composed: true, bubbles: true, detail: {old: props.get('value'), new: this.value}}));
		}
	}

	constructor () {
		super();
		this.activeState = 0;
		this.allowedStyleTypes = [];
		this.allowedTagNames = ['BR', 'P'];
		this.canScrollNext = false;
		this.canScrollPrevious = false;

		this.mutationObserver = (
			() => {
				var sanitizeQueue = [], sanitizing = false;
				this.sanitizeQueue = sanitizeQueue;

				var sanitize = function () {
					sanitizing = true;
					var mutations = sanitizeQueue.shift();
					var sanitized = this.sanitize(mutations);

					if (sanitizeQueue.length) {
						sanitize();
					} else {
						sanitizing = false;

						if (sanitized) {
							var html = this.target.innerHTML || '';
							if (this.states.length > 1) this.states.splice(this.activeState + 1, this.states.length);

							var state = {
								html: html
							};

							if (state.html !== this.states[this.activeState].html) {
								this.states.push(state);
								this.activeState = this.states.length - 1;
								this.value = html;
								this.text = this.target ? this.target.textContent : '';
							}
						}
					}

					return sanitized;
				}.bind(this);

				return new MutationObserver(
					function (mutations) {
						sanitizeQueue.push(mutations);
						if (!sanitizing) sanitize();
						setTimeout(this.updateSelection.bind(this), 10);
					}.bind(this)
				);
			}
		)();

		this.noRedo = false;
		this.noUndo = false;
		this.placeholder = 'Edit your content here...';
		this.replacementTagNames = {'DIV': 'P'};

		this.resources = {
			'br': {
				'Undo': 'Desfazer',
				'Redo': 'Refazer'
			},
			'en': {
				'Undo': 'Undo',
				'Redo': 'Redo',
				'Scroll Previous': 'Scroll Previous',
				'Scroll Next': 'Scroll Next'
			},
			'fr': {
				'Undo': 'Annuler',
				'Redo': 'Rétablir'
			},
			'de': {
				'Undo': 'Rückgängig',
				'Redo': 'Wiederholen'
			}
		};

		this.scrollDelay = 1;
		this.scrollStep = 10;
		this.scrollHeight = 0;
		this.scrollLeft = 0;
		this.scrollTop = 0;
		this.scrollWidth = 0;
		this.showPlaceholder = true;

		this.states = [
			{
				html: '<p><br></p>',
				selection: null
			}
		];

		this._handleDocumentSelectionChange = function () {
			setTimeout(this.updateSelection.bind(this), 10);
		}.bind(this);

		this._handleWindowResize = function () {
			this.scrollHeight = Math.max(0, this.shadowRoot.getElementById('toolbarLayout').scrollHeight - this.shadowRoot.getElementById('toolbarLayout').offsetHeight);
			this.scrollWidth = Math.max(0, this.shadowRoot.getElementById('toolbarLayout').scrollWidth - this.shadowRoot.getElementById('toolbarLayout').offsetWidth);
		}.bind(this);

		this.keys = {};
		this.keys[`${this.modifier.key}+z`] = this.undo;
		this.keys[`${this.modifier.key}+y`] = this.redo;
	}

	paste (e) {
		e.preventDefault();
		var data = e.clipboardData.getData('text/html');
		// If paste does not contain HTML, fall back to plain text
		if (!data.length) data = e.clipboardData.getData('text');
		document.execCommand('insertHTML', false, data);
	}

	static get properties () {
		return {
			//
			// Current position within the states stack
			//
			activeState: {
				type: Number
			},
			//
			// If true, tools can scroll down.
			//
			canScrollNext: {
				type: Boolean
			},
			//
			// If true, tools can scroll up.
			//
			canScrollPrevious: {
				type: Boolean
			},
			//
			// A MutationObserver to update the selection as well as sanitize changes and add them to the states array
			//
			mutationObserver: {
				type: Object
			},
			//
			// Hide the redo button and prevent redo operations
			//
			noRedo: {
				type: Boolean
			},
			//
			// Hide the undo button and prevent undo operations
			//
			noUndo: {
				type: Boolean
			},
			//
			// Text to show when target's trimmed textContent is blank
			//
			placeholder: {
				type: String
			},
			//
			// Delay for scheduling of scroll jobs for the tool container.	Defaults to 1.
			//
			scrollDelay: {
				type: Number
			},
			//
			// Height of tool scroll container
			//
			scrollHeight: {
				type: Number
			},
			//
			// Left offset of tool scroll container
			//
			scrollLeft: {
				type: Number
			},
			//
			// Amount in pixels by which to scroll the tool container up or down.	Defaults to 10.
			//
			scrollStep: {
				type: Number
			},
			//
			// Top offset of tool scroll container
			//
			scrollTop: {
				type: Number
			},
			//
			// Width of tool scroll container
			//
			scrollWidth: {
				type: Number
			},
			//
			// Whether placeholder should be shown
			//
			showPlaceholder: {
				type: Boolean
			},
			//
			// An array containing the undo / redo history of the value property
			//
			states: {
				type: Array
			},
			//
			// The textContent of the target node
			//
			text: {
				type: String
			}
		};
	}

	render () {
		return html`
			<style>
				:host {
					display: block;
					position: relative;
					overflow-y: hidden;
					font-family: var(--wysiwyg-font, Roboto);
				}
	
				#toolbar {
					background: var(--wysiwyg-toolbar-background, #2A9AF2);
					user-select: none;
					color: var(--wysiwyg-toolbar-color, white);
				}

				@media (min-width: 768px) {
					#toolbarLayout {
						overflow: hidden visible;
					}
				}

				@media (max-width: 767.9px) {
					#toolbarLayout {
						overflow: visible hidden;
					}
				}
	
				#editable {
					padding: 20px;
					outline: none;
					flex: 1 1 auto;
				}
	
				#editable[show-placeholder]:before {
					content: attr(placeholder);
					display: block;
					position: absolute;
					opacity: 0.5;
				}
	
				#editable > :first-child {
					margin-top: 0;
				}
	
				#editable > :last-child {
					margin-bottom: 0;
				}
	
				#editable ::selection {
					color: white;
					background: #2A9AF2;
				}
	
				#editable ol {
					padding-left: 30px;
				}
	
				#editable ul {
					padding-left: 30px;
				}
	
				#editable a {
					color: #2A9AF2;
				}

				#editable img:hover {
					cursor: default;
				}

				#editable blockquote[blockquote] {
					padding: 15px;
					margin: 0;
					border-left: 5px solid #eee;
				}

				#editable blockquote:not([blockquote]) {
					padding: 0;
					margin: 0 0 0 20px;
				}
	
				#editable code {
					display: block;
					padding: 10px;
					margin: 10px 0;
					line-height: 1.5;
					background-color: #f7f7f7;
					border-radius: 3px;
					white-space: pre-wrap;
					font-family: monospace;
				}
	
				#editable p:first-child {
					margin-top: 0;
				}
	
				#editable audio-wrapper,
				#editable video-wrapper {
					display: block;
				}

				#editable audio-wrapper:hover,
				#editable video-wrapper:hover {
					cursor: default;
				}
	
				#editable audio,
				#editable video {
					pointer-events: none;
					max-width: 100%;
				}

				#editable table {
					border-spacing: 0;
					border-collapse: collapse;
					width: 100%;
				}

				#editable table,
				#editable th,
				#editable td {
					border: 1px solid black;
				}

				#editable th,
				#editable td {
					padding: 5px 10px;
					height: 20px;
				}

				#editable thead,
				#editable tfoot {
					font-weight: bold;
					background: #ccc;
					text-align: center;
				}

				#editable tbody tr:nth-child(even) {
					background: #f5f5f5;
				}

				md-filled-icon-button {
					min-width: 48px;
					min-height: 48px;
					--md-filled-icon-button-container-shape: 0;
					--md-filled-icon-button-container-width: 48px;
					--md-filled-icon-button-container-height: 48px;
					--md-filled-icon-button-icon-size: 24px;
					--md-sys-color-primary: var(--wysiwyg-tool-theme, #2A9AF2);
				}

				md-filled-icon-button[disabled] {
					--md-sys-color-primary: var(--wysiwyg-tool-icon-disabled-color, rgba(255, 255, 255, 0.5));
				}

				#layout {
					height: 100%;
				}
	
				@media (min-width: 768px) {
					#layout {
						display: flex;
						flex-direction: column;
					}
	
					#toolbar {
						display: flex;
						flex-direction: row;
					}
	
					#toolbarLayout {
						height: 48px;
						display: flex;
						flex-direction: row;
						flex-wrap: nowrap;
					}
	
					#layout[force-narrow] {
						display: flex;
						flex-direction: row;
					}
	
					#layout[force-narrow] #toolbar {
						display: flex;
						flex-direction: column;
					}
	
					#layout[force-narrow] #toolbarLayout {
						height: auto;
						display: flex;
						flex-direction: column;
						width: 48px;
						max-height: calc(100% - 96px);
					}
				}
	
				@media (max-width: 767.9px) {
					#layout {
						display: flex;
						flex-direction: row;
					}
	
					#toolbar {
						display: flex;
						flex-direction: column;
					}
	
					#toolbarLayout {
						display: flex;
						flex-direction: column;
						width: 48px;
						max-height: calc(100% - 96px);
					}
				}
	
				#content {
					overflow-y: auto;
					flex: 1;
					display: flex;
					flex-direction: column;
				}
			</style>
			<div id="layout" ?force-narrow="${this.forceNarrow}">
				<div id="toolbar" on-tap="updateTools" part="toolbar" @restoreSelection="${this.restoreSelection}" @selectElement="${this.selectElement}">
					<md-filled-icon-button id="scrollPrevious" @mouseup="${this._onScrollButtonUp}" @mousedown="${this._onScrollPrevious}" .disabled="${!this.canScrollPrevious}"><md-icon>${this.minWidth768px && !this.forceNarrow ? 'keyboard_arrow_left' : 'keyboard_arrow_ups'}</md-icon></md-filled-icon-button>
					<wysiwyg-tooltip for="scrollPrevious" .position="${this.tooltipPosition}">${this.localize('Scroll Previous')}</wysiwyg-tooltip>
					<div id="toolbarLayout" .scrollTop="${this.scrollTop}" .scrollLeft="${this.scrollLeft}">
						<slot id="tools" @slotchange="${this.slotchange}"></slot>
						<md-filled-icon-button id="undo" @click="${this.undo}" .disabled="${!this.canUndo}" ?hidden="${this.noUndo}"><md-icon>undo</md-icon></md-filled-icon-button>
						<wysiwyg-tooltip for="undo" .position="${this.tooltipPosition}">${this.localize('Undo')} (${this.modifier.tooltip} + Z)</wysiwyg-tooltip>
						<md-filled-icon-button id="redo" @click="${this.redo}" .disabled="${!this.canRedo}" ?hidden="${this.noRedo}"><md-icon>redo</md-icon></md-filled-icon-button>
						<wysiwyg-tooltip for="redo" .position="${this.tooltipPosition}">${this.localize('Redo')} (${this.modifier.tooltip} + Y)</wysiwyg-tooltip>
					</div>
					<md-filled-icon-button id="scrollNext" @mouseup="${this._onScrollButtonUp}" @mousedown="${this._onScrollNext}" .disabled="${!this.canScrollNext}"><md-icon>${this.minWidth768px && !this.forceNarrow ? 'keyboard_arrow_right' : 'keyboard_arrow_down'}</md-icon></md-filled-icon-button>
					<wysiwyg-tooltip for="scrollNext" .position="${this.tooltipPosition}">${this.localize('Scroll Next')}</wysiwyg-tooltip>
				</div>
				<div id="content">
					<div id="editable" contenteditable placeholder="${this.placeholder}" ?show-placeholder="${this.showPlaceholder}" part="editable" @keydown="${this.keydown}" @paste="${this.paste}" @click="${this._editableClickHandler}"></div>
				</div>
			</div>
		`;
	}

	_editableClickHandler (e) {
		switch (e.target.tagName) {
			case 'IMG':
			case 'AUDIO-WRAPPER':
			case 'VIDEO-WRAPPER':
				this.selectElement({detail: {element: e.target}});
				break;
			case 'A':
				e.preventDefault();
				break;
		}
	}

	slotchange () {
		this.updateTools();
	}
	//
	// Perform these tasks when the editor connects to the DOM
	//
	connectedCallback () {
		super.connectedCallback();
		this.observe();
		document.addEventListener('selectionchange', this._handleDocumentSelectionChange);
		window.addEventListener('resize', this._handleWindowResize);
	}
	//
	// Perform these tasks when the editor disconnects from the DOM
	//
	disconnectedCallback () {
		super.disconnectedCallback();
		this.disconnect();
		document.removeEventListener('selectionchange', this._handleDocumentSelectionChange);
		window.removeEventListener('resize', this._handleWindowResize);
	}
	//
	// Stop MutationObserver
	//
	disconnect () {
		if (this.mutationObserver) this.mutationObserver.disconnect();
	}
	//
	// Get the current selection
	//
	getSelection () {
		var parent = this.target;

		while (parent) {
			if ([9, 11].indexOf(parent.nodeType) >= 0 && parent.getSelection) return parent.getSelection();
			parent = parent.parentNode || parent.host;
		}
	}
	//
	// Start MutationObserver
	//
	observe () {
		if (this.mutationObserver && this.target) {
			this.mutationObserver.observe(
				this.target,
				{
					childList: true,
					attributes: true,
					characterData: true,
					subtree: true
				}
			);
		}
	}
	//
	// Revert an undo operation
	//
	redo () {
		if (this.noRedo) return;
		if (!this.states.length || this.activeState >= this.states.length - 1) return false;
		this.disconnect();
		this.activeState += 1;

		setTimeout(
			function () {
				this.observe();
			}.bind(this),
			10
		);
	}
	//
	// Restore selection state
	//
	restoreSelection (e) {
		if (this.debug) console.log('Restoring selection!');
		this.target.focus();
		const range = this.target.ownerDocument.createRange();
		const target = this.target
		const savedSel = (e && e.detail && e.detail.selection) || this.states[this.activeState].selection;
		if (!savedSel) return;
		const startNodeOffset = this._getNodeAndOffsetAt(target, savedSel.start);
		const endNodeOffset = this._getNodeAndOffsetAt(target, savedSel.end);
		range.setStart(startNodeOffset.node, startNodeOffset.offset);
		range.setEnd(endNodeOffset.node, endNodeOffset.offset);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
	//
	// Sanitize DOM changes
	//
	sanitize (mutations) {
		if (!mutations) return true;
		var sanitized = true, nodes = [], i, j, k, p, pre;

		for (i = 0; i < mutations.length; i += 1) {
			var mutation = mutations[i];

			if (nodes.indexOf(mutation.target) === -1) {
				nodes.push(mutation.target);

				if (mutation.target.querySelectorAll) {
					var subnodes = mutation.target.querySelectorAll('*');

					for (k = 0; k < subnodes.length; k += 1) {
						if (nodes.indexOf(subnodes[k]) === -1) nodes.push(subnodes[k]);
					}
				}
			}

			for (j = 0; j < mutation.addedNodes.length; j += 1) {
				var addedNode = mutation.addedNodes[j];

				if (nodes.indexOf(addedNode) === -1) {
					nodes.push(addedNode);

					if (addedNode.querySelectorAll) {
						var subnodes = addedNode.querySelectorAll('*');

						for (k = 0; k < subnodes.length; k += 1) {
							if (nodes.indexOf(subnodes[k]) === -1) nodes.push(subnodes[k]);
						}
					}
				}
			}
		}

		var tools = this.shadowRoot.getElementById('tools').assignedElements ? this.shadowRoot.getElementById('tools').assignedElements({flatten: true}) : [];

		tools = tools.filter(
			function (tool) {
				return tool.nodeType === Node.ELEMENT_NODE;
			}
		);

		var allowedStyleTypes = this.allowedStyleTypes;

		for (j = 0; j < tools.length; j += 1) {
			allowedStyleTypes = allowedStyleTypes.concat(tools[j].allowedStyleTypes);
		}

		var allowedTagNames = this.allowedTagNames;

		for (j = 0; j < tools.length; j += 1) {
			allowedTagNames = allowedTagNames.concat(tools[j].allowedTagNames);
		}

		var replacementTagNames = this.replacementTagNames;

		for (j = 0; j < tools.length; j += 1) {
			replacementTagNames = Object.assign(replacementTagNames, tools[j].replacementTagNames);
		}

		for (i = 0; i < nodes.length; i += 1) {
			var node = nodes[i];

			if (node !== this.target && this.target.contains(node)) {
				//Remove the id attribute
				if (node.hasAttribute && node.hasAttribute('id')) {
					node.removeAttribute('id');
					if (this.debug) console.log(node, 'id attribute');
					sanitized = false;
				}

				//Remove the style attribute
				if (node.hasAttribute && node.hasAttribute('style')) {
					var styles = node.getAttribute('style').split(';'), validStyles = [];

					for (j = 0; j < styles.length; j += 1) {
						if (styles[j]) {
							var style = styles[j].split(':')[0].trim();

							if (allowedStyleTypes.indexOf(style) === -1) {
								node.style[style] = '';
								if (this.debug) console.log(node, 'style: ' + style);
								sanitized = false;
							}
						}
					}
				}

				//Remove the class attribute
				if (node.hasAttribute && node.hasAttribute('class')) {
					node.removeAttribute('class');
					if (this.debug) console.log(node, 'class attribute');
					sanitized = false;
				}

				//If node is a text node immediate child of target, wrap inside a P
				if (node.parentNode === this.target && node.nodeType === Node.TEXT_NODE) {
					if (!node.textContent.trim().length) continue;
					p = document.createElement('p');
					this.target.insertBefore(p, node.nextSibling);
					p.appendChild(node);
					if (this.debug) console.log(node, 'wrap top level text nodes inside P node');
					sanitized = false;
				}

				//If node is a BR node immediate child of target, wrap inside a P
				if (node.parentNode === this.target && node.tagName === 'BR') {
					p = document.createElement('p');
					this.target.insertBefore(p, node.nextSibling);
					p.appendChild(node);
					if (this.debug) console.log(node, 'wrap top level BR nodes inside P node');
					sanitized = false;
				}

				for (j = 0; j < Object.keys(replacementTagNames).length; j += 1) {
					var oldTag = Object.keys(replacementTagNames)[j], newTag = replacementTagNames[Object.keys(replacementTagNames)[j]];

					if (node.tagName === oldTag) {
						node.outerHTML = '<' + newTag + '>' + node.innerHTML + '</' + newTag + '>';
						if (this.debug) console.log(node, 'tag replacement', newTag);
						sanitized = false;
					}
				}

				for (j = 0; j < tools.length; j += 1) {
					if (tools[j].allowedTagNames) {
						for (k = 0; k < tools[j].allowedTagNames.length; k += 1) {
							if (node.tagName === tools[j].allowedTagNames[k] && !tools[j].sanitize(node)) {
								if (this.debug) console.log(node, 'tool sanitize');
								sanitized = false;
							}
						}
					}
				}

				//Make sure tagName is allowed
				if (node.parentNode && node.tagName && allowedTagNames.indexOf(node.tagName) === -1) {
					node.outerHTML = node.innerHTML;
					if (this.debug) console.log(node, 'invalid tagName');
					sanitized = false;
				}
			}
		}

		//Guard against improper values
		if (!this.target.children.length) {
			p = document.createElement('p');
			var br = document.createElement('br');
			p.appendChild(br);
			this.target.appendChild(p);
			if (this.debug) console.log('improper value');
			sanitized = false;
		}

		return sanitized;
	}
	//
	// Update selection to select a specific element
	//
	selectElement(e) {
		const element = e && e.detail && e.detail.element;
		if (!element) return;
		if (!this.target.contains(element)) return;
		const selection = this.getSelection();
		selection.removeAllRanges();
		const range = document.createRange();

		if (['IMG', 'AUDIO-WRAPPER', 'VIDEO-WRAPPER'].includes(element.tagName)) {
			range.selectNode(element);
		} else {
			range.selectNodeContents(element);
		}

		selection.addRange(range);

		setTimeout(
			() => {
				this.updateSelection();
			},
			10
		);
	}
	//
	// Perform an undo operation
	//
	undo () {
		if (this.noUndo) return;
		if (!this.states.length || this.activeState <= 0) return false;
		this.disconnect();
		this.activeState -= 1;

		setTimeout(
			function () {
				this.observe();
			}.bind(this),
			10
		);
	}
	//
	// Update properties based on the current selection
	//
	updateSelection () {
		var selection = this.getSelection();

		if (selection && selection.focusNode === this.target && selection.getRangeAt(0).endOffset === 0) {
			var range = document.createRange();
			var node = this.target.children[0];
			range.setStart(node, 0);
			range.setEnd(node, 0);
			selection.removeAllRanges();
			selection.addRange(range);
			return;
		}

		if (selection && selection.anchorNode && this.target.contains(selection.anchorNode.nodeType === 1 ? selection.anchorNode : selection.anchorNode.parentNode)) {
			this.selection = Object.freeze(
				{
					anchorNode: selection.anchorNode,
					anchorOffset: selection.anchorOffset,
					focusNode: selection.focusNode,
					focusOffset: selection.focusOffset,
					isCollapse: selection.isCollapsed,
					rangeCount: selection.rangeCount,
					type: selection.type,
					baseNode: selection.baseNode,
					baseOffset: selection.baseOffset,
					extentNode: selection.extentNode,
					extentOffset: selection.extentOffset,
					range0: (selection && selection.rangeCount) ? selection.getRangeAt(0) : null,
					commonAncestorPath: (
						(selection) => {
							const range0 = (selection && selection.rangeCount) ? selection.getRangeAt(0) : null;
							if (!range0) return null;
							let element = range0.commonAncestorContainer;
							const path = [];
					
							while (this.target.contains(element)) {
								path.push(element);
								element = element.parentNode;
							}

							return path;
						}
					)(selection)
				}
			);

			setTimeout(
				() => {

					if (this.shadowRoot.activeElement && this.target.contains(this.shadowRoot.activeElement)) {
						this.states[this.activeState].selection = {
							start: this._getNodeOffset(this.target, this.selection.range0.startContainer) + this._totalOffsets(this.selection.range0.startContainer, this.selection.range0.startOffset),
							end: this._getNodeOffset(this.target, this.selection.range0.endContainer) + this._totalOffsets(this.selection.range0.endContainer, this.selection.range0.endOffset)
						};
					}
				},
				50
			);
		}
	}
	//
	// Update tools properties
	//
	updateTools () {
		if (this._handleWindowResize) this._handleWindowResize();
		var now = new Date();

		if (this._toolUpdateTimeout) {
			delete this._toolUpdateTimeout;
			clearTimeout(this._toolUpdateTimeout);
		}

		if (this._lastToolUpdate && now - this._lastToolUpdate < 250) {
			this._toolUpdateTimeout = setTimeout(this.updateTools.bind(this), 250 - (now - this._lastToolUpdate));
			return;
		}

		this._lastToolUpdate = now;
		var tools = this.shadowRoot.getElementById('tools').assignedElements ? this.shadowRoot.getElementById('tools').assignedElements({flatten: true}) : [];

		for (var i = 0; i < tools.length; i += 1) {
			if (!(tools[i] instanceof WysiwygTool)) continue;
			tools[i].canRedo = this.canRedo;
			tools[i].canUndo = this.canUndo;
			tools[i].debug = this.debug;
			tools[i].forceNarrow = this.forceNarrow;
			tools[i].language = this.language;
			tools[i].minWidth768px = this.minWidth768px;
			tools[i].modifier = this.modifier;
			tools[i].selection = this.selection;
			tools[i].target = this.target;
			tools[i].tooltipPosition = this.tooltipPosition;
			tools[i].value = this.value;
		}
	}

	_backspace (event) {
		if (!this.target || !this.target.contains(event.composedPath()[0])) return;
		event.preventDefault();
		if (!this.selection.range0) return;
		if (event.altKey || event.shiftKey) return;

		var singleBackspace = function () {
			if (this.target.children.length > 0) {
				document.execCommand('delete');
			} else {
				document.execCommand('formatBlock', null, 'P');
			}
		}.bind(this);

		var wholeWordBackspace = function (lastWord, lastWordPosition) {
			this.selection.range0.collapse(true);
			this.selection.range0.setStart(this.selection.range0.commonAncestorContainer, lastWordPosition);
			this.selection.range0.setEnd(this.selection.range0.commonAncestorContainer, this.selection.range0.commonAncestorContainer.textContent.length < lastWordPosition + lastWord.length + 1 ? this.selection.range0.commonAncestorContainer : lastWordPosition + lastWord.length + 1);
			this.selection.range0.deleteContents();
		}.bind(this);

		if (event.ctrlKey || event.metaKey) {
			var range = this.selection.range0.cloneRange();
			range.collapse();
			range.setStart(this.selection.range0.commonAncestorContainer, 0);
			var preceding = range.toString();

			if (preceding.length) {
				var match = preceding.match(/(?:\s|^)([\S]+)$/i);

				if (match) {
					wholeWordBackspace(match.slice(-1)[0], match.index);
				} else if (preceding.trim().split(' ').length === 1) {
					wholeWordBackspace(preceding.split(' ')[0], 0);
				} else {
					singleBackspace();
				}
			} else {
				singleBackspace();
			}
		} else {
			singleBackspace();
		}
	}

	_delete (event) {
		if (!this.target || !this.target.contains(event.composedPath()[0])) return;
		event.preventDefault();
		document.execCommand('forwardDelete');
	}

	_onScrollButtonUp () {
		clearInterval(this._scrollJob);
		this._scrollJob = null;
	}

	_onScrollNext () {
		this._scrollNext();
		this._scrollJob = setInterval(this._scrollNext.bind(this), this.scrollDelay);
	}

	_onScrollPrevious () {
		this._scrollPrevious();
		this._scrollJob = setInterval(this._scrollPrevious.bind(this), this.scrollDelay);
	}

	_scroll (dx) {
		if (!this.forceNarrow && this.minWidth768px) {
			this.scrollLeft += dx;
		} else {
			this.scrollTop += dx;
		}
	}

	_scrollNext () {
		if (!this.forceNarrow && this.minWidth768px) {
			if (this.scrollLeft + this.scrollStep > this.scrollWidth) {
				this._scroll(this.scrollWidth - this.scrollLeft);
				this._onScrollButtonUp();
			} else {
				this._scroll(this.scrollStep);
			}
		} else {
			if (this.scrollTop + this.scrollStep > this.scrollHeight) {
				this._scroll(this.scrollHeight - this.scrollTop);
				this._onScrollButtonUp();
			} else {
				this._scroll(this.scrollStep);
			}
		}
	}

	_scrollPrevious () {
		if (!this.forceNarrow && this.minWidth768px) {
			if (this.scrollLeft - this.scrollStep < 0) {
				this._scroll(-this.scrollLeft);
				this._onScrollButtonUp();
			} else {
				this._scroll(-this.scrollStep);
			}
		} else {
			if (this.scrollTop - this.scrollStep < 0) {
				this._scroll(-this.scrollTop);
				this._onScrollButtonUp();
			} else {
				this._scroll(-this.scrollStep);
			}
		}
	}

	_tab (event) {
		event.preventDefault();
	}
}

customElements.define('wysiwyg-e', WysiwygE);