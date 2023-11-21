import { LitElement } from 'lit';

const KEY_IDENTIFIER = {
	'U+0008': 'backspace',
	'U+0009': 'tab',
	'U+001B': 'esc',
	'U+0020': 'space',
	'U+007F': 'del'
};

/**
 * Special table for KeyboardEvent.keyCode.
 * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better
 * than that.
 *
 * Values from:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
 */
const KEY_CODE = {
	8: 'backspace',
	9: 'tab',
	13: 'enter',
	27: 'esc',
	33: 'pageup',
	34: 'pagedown',
	35: 'end',
	36: 'home',
	32: 'space',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	46: 'del',
	106: '*'
};

/**
 * MODIFIER_KEYS maps the short name for modifier keys used in a key
 * combo string to the property name that references those same keys
 * in a KeyboardEvent instance.
 */
const MODIFIER_KEYS = {
	'shift': 'shiftKey',
	'ctrl': 'ctrlKey',
	'alt': 'altKey',
	'meta': 'metaKey'
};

/**
 * KeyboardEvent.key is mostly represented by printable character made by
 * the keyboard, with unprintable keys labeled nicely.
 *
 * However, on OS X, Alt+char can make a Unicode character that follows an
 * Apple-specific mapping. In this case, we fall back to .keyCode.
 */
const KEY_CHAR = /[a-z0-9*]/;

/**
 * Matches a keyIdentifier string.
 */
const IDENT_CHAR = /U\+/;

/**
 * Matches arrow keys in Gecko 27.0+
 */
const ARROW_KEY = /^arrow/;

/**
 * Matches space keys everywhere (notably including IE10's exceptional name
 * `spacebar`).
 */
const SPACE_KEY = /^space(bar)?/;

/**
 * Matches ESC key.
 *
 * Value from: http://w3c.github.io/uievents-key/#key-Escape
 */
const ESC_KEY = /^escape$/;

export class WysiwygBase extends LitElement {
	constructor () {
		super();
		this.allowedStyleTypes = [];
		this.allowedTagNames = [];
		this.canRedo = false;
		this.canUndo = false;
		this.debug = false;
		this.forceNarrow = false;
		this.language = 'en';

		window.matchMedia('(min-width: 767.9px)').addListener(
			(e) => {
				this.minWidth768px = e.matches;
			}
		);

		this.minWidth768px = window.matchMedia('(min-width: 767.9px)').matches;

		this.modifier = {
			key: navigator.platform.indexOf('Mac') >= 0 ? 'meta' : 'ctrl',
			tooltip: navigator.platform.indexOf('Mac') >= 0 ? '⌘' : 'Ctrl'
		};

		this.replacementTagNames = {};
		this.resources = {};
		this.target = this;
		this.tooltipPosition = 'bottom';
		this.value = '';
		this.selection = null;
		this.keys = {};

		this._keydownHandler = function (event) {
			Object.keys(this.keys).forEach(
				(binding) => {
					const keyCombo = this._parseKeyComboString(binding);
					const matches = this._keyComboMatchesEvent(keyCombo, event);
					
					if (matches) {
						const action = this.keys[binding].bind(this);
						action();
					}
				}
			);
		}.bind(this);
	}

	static get properties () {
		return {
			//
			// Array of style types allowed by the sanitize method
			//
			allowedStyleTypes: {
				type: Array
			},
			//
			// Array of tagNames allowed by editor for its sanitize method
			//
			allowedTagNames: {
				type: Array
			},
			//
			// Whether a redo action is available
			//
			canRedo: {
				type: Boolean
			},
			//
			// Whether an undo action is available
			//
			canUndo: {
				type: Boolean
			},
			//
			// If true, console.log debug messages.
			//
			debug: {
				type: Boolean
			},
			//
			// If true, force narrow view with vertical toolbar
			//
			forceNarrow: {
				type: Boolean
			},
			//
			// An object mapping key bindings to actions
			//
			keys: {
				type: Object
			},
			//
			// Two-letter language code for localization
			//
			language: {
				type: String
			},
			//
			// Tracks viewport width
			//
			minWidth768px: {
				type: Boolean
			},
			//
			// Modifier for keyboard shortcuts: Cmd key for Macs, Ctrl key for all others
			//
			modifier: {
				type: Object
			},
			//
			// Key-value pairs of tags that should be replaced by other tags
			//
			replacementTagNames: {
				type: Object
			},
			//
			// Contains localized versions of text
			//
			resources: {
				type: Object
			},
			//
			// The editor's current text selection
			//
			selection: {
				type: Object
			},
			//
			// The target to manage
			//
			target: {
				type: Object
			},
			//
			// Position of tooltips relative to tool buttons
			//
			tooltipPosition: {
				type: String
			},
			//
			// The current innerHTML of the target node
			//
			value: {
				type: String
			}
		};
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener('keydown', this._keydownHandler);
	}

	disconnectedCallback() {
		super.connectedCallback();
		document.removeEventListener('keydown', this._keydownHandler);
	}

	updated (props) {
		super.updated(props);
		if (!props) return;

		if (props.has('minWidth768px') || props.has('forceNarrow')) {
			this.tooltipPosition = (this.minWidth768px && !this.forceNarrow) ? 'bottom' : 'right';
		}

		if (props.has('value')) {
			if (typeof this.value !== 'string') {
				this.value = '';
			}
		}
	}

	firstUpdated () {
		super.firstUpdated();
		if (!this.value) this.value = '<p><br></p>';
		this.sanitize();
	}

	localize (stringKey) {
		let localized = '';

		if (this.resources && this.resources[this.language] && this.resources[this.language][stringKey]) {
			localized = this.resources[this.language][stringKey];
		}

		return localized;
	}

	_calculateNodeOffset (node) {
		var offset = 0;

		if (node.nodeType === 3) {
			offset += node.nodeValue.length + 1;
		} else {
			offset += 1;
		}

		if (node.childNodes) {
			for (var i = 0; i < node.childNodes.length; i += 1) {
				offset += this._calculateNodeOffset(node.childNodes[i]);
			}
		}

		return offset;
	}

	_getNodeAndOffsetAt(start, offset) {
		var node = start;
		var stack = [];

		while (true) {
			if (offset <= 0) {
				return {
					node: node,
					offset: 0
				};
			}

			if (node.nodeType == 3 && (offset <= node.nodeValue.length)) {
				return {
					node: node,
					offset: Math.min(offset, node.nodeValue.length)
				};
			}

			if (node.firstChild) {
				if (node !== start) offset -= 1;
				stack.push(node);
				node = node.firstChild;
			} else if (stack.length > 0 && node.nextSibling) {
				if (node.nodeType === 3) {
					offset -= node.nodeValue.length + 1;
				} else {
					offset -= 1;
				}

				node = node.nextSibling;
			} else {
				while (true) {
					if (stack.length <= 1) {
						if (node.nodeType == 3) {
							return {
								node: node,
								offset: Math.min(offset, node.nodeValue.length)
							};
						} else {
							return {
								node: node,
								offset: 0
							};
						}
					}

					var next = stack.pop();

					if (next.nextSibling) {
						if (node.nodeType === 3) {
							offset -= node.nodeValue.length + 1;
						} else {
							offset -= 1;
						}

						node = next.nextSibling;
						break;
					}
				}
			}
		}
	}

	_getNodeOffset (start, dest) {
		var offset = 0;

		var node = start;
		var stack = [];

		while (true) {
			if (node === dest) {
				return offset;
			}

			if (node.firstChild) {
				if (node !== start) offset += 1;
				stack.push(node);
				node = node.firstChild;
			} else if (stack.length > 0 && node.nextSibling) {
				if (node.nodeType === 3) {
					offset += node.nodeValue.length + 1;
				} else {
					offset += 1;
				}

				node = node.nextSibling;
			} else {
				if (node.nodeType === 3) {
					offset += node.nodeValue.length + 1;
				} else {
					offset += 1;
				}

				while (true) {
					if (stack.length <= 1) return offset;
					var next = stack.pop();

					if (next.nextSibling) {
						node = next.nextSibling;
						break;
					}
				}
			}
		}
	}

	_totalOffsets (parentNode, offset) {
		if (parentNode.nodeType == 3) return offset;

		if (parentNode.nodeType == 1) {
			var total = 0;

			for (var i = 0; i < offset; i += 1) {
				total += this._calculateNodeOffset(parentNode.childNodes[i]);
			}

			return total;
		}

		return 0;
	}

	_parseKeyComboString (keyComboString) {
		if (keyComboString.length === 1) {
			return { combo: keyComboString, key: keyComboString, event: 'keydown' };
		}

		return keyComboString.split('+').reduce(
			(parsedKeyCombo, keyComboPart) => {
				var eventParts = keyComboPart.split(':');
				var keyName = eventParts[0];
				var event = eventParts[1];

				if (keyName in MODIFIER_KEYS) {
					parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
					parsedKeyCombo.hasModifiers = true;
				} else {
					parsedKeyCombo.key = keyName;
					parsedKeyCombo.event = event || 'keydown';
				}

				return parsedKeyCombo;
			},
			{
				combo: keyComboString.split(':').shift()
			}
		);
	}

	_keyComboMatchesEvent (keyCombo, event) {
		// For combos with modifiers we support only alpha-numeric keys
		var keyEvent = this._normalizedKeyForEvent(event, keyCombo.hasModifiers);

		return !!(
			keyEvent === keyCombo.key && (
				(
					!keyCombo.hasModifiers
					&& !event.shiftKey
					&& !event.ctrlKey
					&& !event.altKey
					&& !event.metaKey
				) || (
					keyCombo.hasModifiers
					&& !!event.shiftKey === !!keyCombo.shiftKey
					&& !!event.ctrlKey === !!keyCombo.ctrlKey
					&& !!event.altKey === !!keyCombo.altKey
					&& !!event.metaKey === !!keyCombo.metaKey
				)
			)
		);
	}

	_normalizedKeyForEvent (keyEvent, noSpecialChars) {
		if (keyEvent.key) return this._transformKey(keyEvent.key, noSpecialChars);
		if (keyEvent.detail && keyEvent.detail.key) return this._transformKey(keyEvent.detail.key, noSpecialChars);
		return this._transformKeyIdentifier(keyEvent.keyIdentifier) || this._transformKeyCode(keyEvent.keyCode) || '';
	}

	_transformKey (key, noSpecialChars) {
		var validKey = '';

		if (key) {
			var lKey = key.toLowerCase();
			if (lKey === ' ' || SPACE_KEY.test(lKey)) {
				validKey = 'space';
			} else if (ESC_KEY.test(lKey)) {
				validKey = 'esc';
			} else if (lKey.length == 1) {
				if (!noSpecialChars || KEY_CHAR.test(lKey)) {
					validKey = lKey;
				}
			} else if (ARROW_KEY.test(lKey)) {
				validKey = lKey.replace('arrow', '');
			} else if (lKey == 'multiply') {
				// numpad '*' can map to Multiply on IE/Windows
				validKey = '*';
			} else {
				validKey = lKey;
			}
		}

		return validKey;
	}

	_transformKeyIdentifier(keyIdent) {
		var validKey = '';

		if (keyIdent) {
			if (keyIdent in KEY_IDENTIFIER) {
				validKey = KEY_IDENTIFIER[keyIdent];
			} else if (IDENT_CHAR.test(keyIdent)) {
				keyIdent = parseInt(keyIdent.replace('U+', '0x'), 16);
				validKey = String.fromCharCode(keyIdent).toLowerCase();
			} else {
				validKey = keyIdent.toLowerCase();
			}
		}

		return validKey;
	}

	_transformKeyCode(keyCode) {
		var validKey = '';

		if (Number(keyCode)) {
			if (keyCode >= 65 && keyCode <= 90) {
				// ascii a-z
				// lowercase is 32 offset from uppercase
				validKey = String.fromCharCode(32 + keyCode);
			} else if (keyCode >= 112 && keyCode <= 123) {
				// function keys f1-f12
				validKey = 'f' + (keyCode - 112 + 1);
			} else if (keyCode >= 48 && keyCode <= 57) {
				// top 0-9 keys
				validKey = String(keyCode - 48);
			} else if (keyCode >= 96 && keyCode <= 105) {
				// num pad 0-9
				validKey = String(keyCode - 96);
			} else {
				validKey = KEY_CODE[keyCode];
			}
		}

		return validKey;
	}
}

customElements.define('wysiwyg-base', WysiwygBase);