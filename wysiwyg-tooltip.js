import { LitElement, html } from 'lit';

class WysiwygTooltip extends LitElement {
	static get properties() {
		return {
			position: {
				type: String
			},
			offset: {
				type: Number
			}
		}
	};

	updated(props) {
		super.updated();

		if (props.has('position') && !['top', 'right', 'bottom', 'left'].includes(this.position)) {
			this.position = 'bottom';
		}

		if (props.has('offset') && Number.isNaN(this.offset)) {
			this.offset = 20;
		}
	}

	render() {
		return html`
			<style>
				:host {
					display: block;
					position: absolute;
					outline: none;
					z-index: 1002;
					-moz-user-select: none;
					-ms-user-select: none;
					-webkit-user-select: none;
					user-select: none;
					cursor: default;
				}

				#tooltip {
					display: block;
					outline: none;
					font-size: 10px;
					line-height: 1;
					background-color: #616161;
					color: white;
					padding: 8px;
					border-radius: 2px;
				}

				@keyframes keyFrameScaleUp {
					0% {
						transform: scale(0.0);
					}

					100% {
						transform: scale(1.0);
					}
				}

				@keyframes keyFrameScaleDown {
					0% {
						transform: scale(1.0);
					}

					100% {
						transform: scale(0.0);
					}
				}

				@keyframes keyFrameFadeInOpacity {
					0% {
						opacity: 0;
					}

					100% {
						opacity: 0.9;
					}
				}

				@keyframes keyFrameFadeOutOpacity {
					0% {
						opacity: 0.9;
					}

					100% {
						opacity: 0;
					}
				}

				@keyframes keyFrameSlideDownIn {
					0% {
						transform: translateY(-2000px);
						opacity: 0;
					}

					10% {
						opacity: 0.2;
					}

					100% {
						transform: translateY(0);
						opacity: 0.9;
					}
				}

				@keyframes keyFrameSlideDownOut {
					0% {
						transform: translateY(0);
						opacity: var(--wysiwyg-tooltip-opacity, 0.9);
					}

					10% {
						opacity: 0.2;
					}

					100% {
						transform: translateY(-2000px);
						opacity: 0;
					}
				}

				.fade-in-animation {
					opacity: 0;
					animation-delay: 0;
					animation-name: keyFrameFadeInOpacity;
					animation-iteration-count: 1;
					animation-timing-function: ease-in;
					animation-duration: 500ms;
					animation-fill-mode: forwards;
				}

				.fade-out-animation {
					opacity: 0.9;
					animation-delay: 0ms;
					animation-name: keyFrameFadeOutOpacity;
					animation-iteration-count: 1;
					animation-timing-function: ease-in;
					animation-duration: 500ms;
					animation-fill-mode: forwards;
				}

				.cancel-animation {
					animation-delay: -30s !important;
				}

				/* Thanks IE 10. */

				.hidden {
					display: none !important;
				}
			</style>
			<div id="tooltip" class="hidden">
				<slot></slot>
			</div>
		`;
	}

	constructor() {
		super();
		this.manualMode = false;
		this.position = 'bottom';
		this.fitToVisibleBounds = false;
		this.offset = 14;
		this.marginTop = 14;
		this.animationDelay = 500;
		this.animationEntry = '';
		this.animationExit = '';
		this._showing = false;

		this.animationConfig = {
			'entry': [
				{
					name: 'fade-in-animation',
					node: this,
					timing: {
						delay: 0
					}
				}
			],
			'exit': [
				{
					name: 'fade-out-animation',
					node: this
				}
			]
		};

		this.setAttribute('role', 'tooltip');
		this.setAttribute('tabindex', '-1');

		this.addEventListener(
			'animationEnd',
			this._onAnimationEnd
		);
	}

	updated(props) {
		if (props.has('for')) this._findTarget();
		if (props.has('manualMode')) this._manualModeChanged();
		if (props.has('animationDelay')) this._delayChange();
	}

	static get properties() {
		return {
			/**
			 * The id of the element that the tooltip is anchored to. This element
			 * must be a sibling of the tooltip. If this property is not set,
			 * then the tooltip will be centered to the parent node containing it.
			 */
			for: { type: String, },
			/**
			 * Set this to true if you want to manually control when the tooltip
			 * is shown or hidden.
			 */
			manualMode: { type: Boolean },
			/**
			 * Positions the tooltip to the top, right, bottom, left of its content.
			 */
			position: { type: String },
			/**
			 * If true, no parts of the tooltip will ever be shown offscreen.
			 */
			fitToVisibleBounds: { type: Boolean },
			/**
			 * The spacing between the top of the tooltip and the element it is
			 * anchored to.
			 */
			offset: { type: Number },
			/**
			 * This property is deprecated, but left over so that it doesn't
			 * break exiting code. Please use `offset` instead. If both `offset` and
			 * `marginTop` are provided, `marginTop` will be ignored.
			 * @deprecated since version 1.0.3
			 */
			marginTop: { type: Number },
			/**
			 * The delay that will be applied before the `entry` animation is
			 * played when showing the tooltip.
			 */
			animationDelay: { type: Number },
			/**
			 * The animation that will be played on entry.  This replaces the
			 * deprecated animationConfig.  Entries here will override the
			 * animationConfig settings.  You can enter your own animation
			 * by setting it to the css class name.
			 */
			animationEntry: { type: String },
			/**
			 * The animation that will be played on exit.  This replaces the
			 * deprecated animationConfig.  Entries here will override the
			 * animationConfig settings.  You can enter your own animation
			 * by setting it to the css class name.
			 */
			animationExit: { type: String },
			/**
			 * This property is deprecated.  Use --wysiwyg-tooltip-animation to change the
			 * animation. The entry and exit animations that will be played when showing
			 * and hiding the tooltip. If you want to override this, you must ensure
			 * that your animationConfig has the exact format below.
			 * @deprecated since version
			 *
			 * The entry and exit animations that will be played when showing and
			 * hiding the tooltip. If you want to override this, you must ensure
			 * that your animationConfig has the exact format below.
			 */
			animationConfig: { type: Object },
			_showing: { type: Boolean }
		};
	}

	get target () {
		var parentNode = this.parentNode;
		// If the parentNode is a document fragment, then we need to use the host.
		var ownerRoot = this.getRootNode();
		var target;
		if (this.for) {
			target = ownerRoot.querySelector('#' + this.for);
		} else {
			target = parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE ?
				ownerRoot.host :
				parentNode;
		}
		return target;
	}

	firstUpdated () {
		this._findTarget();
	}

	disconnectedCallback () {
		if (!this.manualMode) this._removeListeners();
	}

	playAnimation (type) {
		if (type === 'entry') {
			this.show();
		} else if (type === 'exit') {
			this.hide();
		}
	}

	cancelAnimation () {
		this.shadowRoot.getElementById('tooltip').classList.add('cancel-animation');
	}

	show () {
		// If the tooltip is already showing, there's nothing to do.
		if (this._showing)
			return;

		if (this.textContent.trim() === '') {
			// Check if effective children are also empty
			var allChildrenEmpty = true;
			var effectiveChildren = this.childNodes;
			for (var i = 0; i < effectiveChildren.length; i++) {
				if (effectiveChildren[i].textContent.trim() !== '') {
					allChildrenEmpty = false;
					break;
				}
			}
			if (allChildrenEmpty) {
				return;
			}
		}

		this._showing = true;
		this.shadowRoot.getElementById('tooltip').classList.remove('hidden');
		this.shadowRoot.getElementById('tooltip').classList.remove('cancel-animation');
		this.shadowRoot.getElementById('tooltip').classList.remove(this._getAnimationType('exit'));
		this.updatePosition();
		this._animationPlaying = true;
		this.shadowRoot.getElementById('tooltip').classList.add(this._getAnimationType('entry'));
	}

	hide () {
		// If the tooltip is already hidden, there's nothing to do.
		if (!this._showing) {
			return;
		}

		// If the entry animation is still playing, don't try to play the exit
		// animation since this will reset the opacity to 1. Just end the animation.
		if (this._animationPlaying) {
			this._showing = false;
			this._cancelAnimation();
			return;
		} else {
			// Play Exit Animation
			this._onAnimationFinish();
		}

		this._showing = false;
		this._animationPlaying = true;
	}

	updatePosition () {
		if (!this._target || !this.offsetParent)
			return;
		var offset = this.offset;
		// If a marginTop has been provided by the user (pre 1.0.3), use it.
		if (this.marginTop != 14 && this.offset == 14)
			offset = this.marginTop;
		var parentRect = this.offsetParent.getBoundingClientRect();
		var targetRect = this._target.getBoundingClientRect();
		var thisRect = this.getBoundingClientRect();
		var horizontalCenterOffset = (targetRect.width - thisRect.width) / 2;
		var verticalCenterOffset = (targetRect.height - thisRect.height) / 2;
		var targetLeft = targetRect.left - parentRect.left;
		var targetTop = targetRect.top - parentRect.top;
		var tooltipLeft, tooltipTop;
		switch (this.position) {
			case 'top':
				tooltipLeft = targetLeft + horizontalCenterOffset;
				tooltipTop = targetTop - thisRect.height - offset;
				break;
			case 'bottom':
				tooltipLeft = targetLeft + horizontalCenterOffset;
				tooltipTop = targetTop + targetRect.height + offset;
				break;
			case 'left':
				tooltipLeft = targetLeft - thisRect.width - offset;
				tooltipTop = targetTop + verticalCenterOffset;
				break;
			case 'right':
				tooltipLeft = targetLeft + targetRect.width + offset;
				tooltipTop = targetTop + verticalCenterOffset;
				break;
		}
		// TODO(noms): This should use IronFitBehavior if possible.
		if (this.fitToVisibleBounds) {
			// Clip the left/right side
			if (parentRect.left + tooltipLeft + thisRect.width > window.innerWidth) {
				this.style.right = '0px';
				this.style.left = 'auto';
			} else {
				this.style.left = Math.max(0, tooltipLeft) + 'px';
				this.style.right = 'auto';
			}
			// Clip the top/bottom side.
			if (parentRect.top + tooltipTop + thisRect.height > window.innerHeight) {
				this.style.bottom = (parentRect.height - targetTop + offset) + 'px';
				this.style.top = 'auto';
			} else {
				this.style.top = Math.max(-parentRect.top, tooltipTop) + 'px';
				this.style.bottom = 'auto';
			}
		} else {
			this.style.left = tooltipLeft + 'px';
			this.style.top = tooltipTop + 'px';
		}
	}

	_addListeners () {
		if (this._target) {
			this._target.addEventListener('mouseenter', this.show.bind(this));
			this._target.addEventListener('focus', this.show.bind(this));
			this._target.addEventListener('mouseleave', this.hide.bind(this));
			this._target.addEventListener('blur', this.hide.bind(this));
			this._target.addEventListener('tap', this.hide.bind(this));
		}

		if (this.shadowRoot.getElementById('tooltip')) this.shadowRoot.getElementById('tooltip').addEventListener('animationend', this._onAnimationEnd.bind(this));
		this.addEventListener('mouseenter', this.hide.bind(this));
	}

	_findTarget () {
		if (!this.manualMode)
			this._removeListeners();
		this._target = this.target;
		if (!this.manualMode)
			this._addListeners();
	}

	_delayChange (newValue) {
		// Only Update delay if different value set
		if (newValue !== 500) {
			//this.updateStyles({ '--wysiwyg-tooltip-delay-in': newValue + 'ms' });
		}
	}

	_manualModeChanged () {
		if (this.manualMode)
			this._removeListeners();
		else
			this._addListeners();
	}

	_cancelAnimation () {
		// Short-cut and cancel all animations and hide
		this.shadowRoot.getElementById('tooltip').classList.remove(this._getAnimationType('entry'));
		this.shadowRoot.getElementById('tooltip').classList.remove(this._getAnimationType('exit'));
		this.shadowRoot.getElementById('tooltip').classList.remove('cancel-animation');
		this.shadowRoot.getElementById('tooltip').classList.add('hidden');
	}

	_onAnimationFinish () {
		if (this._showing) {
			this.shadowRoot.getElementById('tooltip').classList.remove(this._getAnimationType('entry'));
			this.shadowRoot.getElementById('tooltip').classList.remove('cancel-animation');
			this.shadowRoot.getElementById('tooltip').classList.add(this._getAnimationType('exit'));
		}
	}

	_onAnimationEnd () {
		// If no longer showing add class hidden to completely hide tooltip
		this._animationPlaying = false;
		if (!this._showing) {
			this.shadowRoot.getElementById('tooltip').classList.remove(this._getAnimationType('exit'));
			this.shadowRoot.getElementById('tooltip').classList.add('hidden');
		}
	}

	_getAnimationType (type) {
		// These properties have priority over animationConfig values
		if ((type === 'entry') && (this.animationEntry !== '')) {
			return this.animationEntry;
		}
		if ((type === 'exit') && (this.animationExit !== '')) {
			return this.animationExit;
		}
		// If no results then return the legacy value from animationConfig
		if (this.animationConfig[type] &&
			typeof this.animationConfig[type][0].name === 'string') {
			// Checking Timing and Update if necessary - Legacy for animationConfig
			if (this.animationConfig[type][0].timing &&
				this.animationConfig[type][0].timing.delay &&
				this.animationConfig[type][0].timing.delay !== 0) {
				var timingDelay = this.animationConfig[type][0].timing.delay;
				// Has Timing Change - Update CSS
				if (type === 'entry') {
					//this.updateStyles({ '--wysiwyg-tooltip-delay-in': timingDelay + 'ms' });
				} else if (type === 'exit') {
					//this.updateStyles({ '--wysiwyg-tooltip-delay-out': timingDelay + 'ms' });
				}
			}
			return this.animationConfig[type][0].name;
		}
	}

	_removeListeners () {
		if (this._target) {
			this._target.removeEventListener('mouseenter', this.show);
			this._target.removeEventListener('focus', this.show);
			this._target.removeEventListener('mouseleave', this.hide);
			this._target.removeEventListener('blur', this.hide);
			this._target.removeEventListener('tap', this.hide);
		}

		if (this.shadowRoot.getElementById('tooltip')) this.shadowRoot.getElementById('tooltip').removeEventListener('animationend', this._onAnimationEnd);
		this.removeEventListener('mouseenter', this.hide);
	}
}

customElements.define('wysiwyg-tooltip', WysiwygTooltip);