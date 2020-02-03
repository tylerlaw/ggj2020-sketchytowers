/** @file Mouse.ts */

/// <reference path="Cursor.ts" />
/// <reference path="MouseButton.ts" />
/// <reference path="MouseWheel.ts" />

/**
 * Handler interface for when a mouse move triggers an event.
 * @param dx The delta x movement of the mouse.
 * @param dy The delta y movement of the mouse.
 */
interface MouseMoveHandler { (dx:int, dy:int):void; }

/**
 * AppComponent for working with mouse input and state.
 * QUIRKS:
 * - the mouse position and over state may be invalid if the game window size/position changes or fullscreen changes
 * - the local mouse position is close, but not 100% accurate because its backed into using clientX/Y to avoid DOM reflows
 * @staticclass
 */
// tslint:disable-next-line: typedef
const Mouse = new (class
{
	//#region Events
	/** Fire when the mouse enters the game element. */
	public readonly onOver:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	/** Fire when the mouse moves. */
	public readonly onMove:DelegateEvent<MouseMoveHandler> = new DelegateEvent<MouseMoveHandler>();

	/** Fire when the mouse leaves the game element. */
	public readonly onOut:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	/** Fired when a mouse button is pressed down. Fired BEFORE the button's event. */
	public readonly onPress:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();

	/** Fired when a mouse button is released. Fired BEFORE the button's event. */
	public readonly onRelease:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();

	/** Fired when a mouse button press is canceled. Fired BEFORE the button's event. */
	public readonly onCancel:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();

	/** Fired when the wheel is scrolled. Fired BEFORE the wheel's event. */
	public readonly onScroll:DelegateEvent<MouseWheelScrollHandler> = new DelegateEvent<MouseWheelScrollHandler>();
	
	/** Fired when the wheel scroll is reset. Fired BEFORE the wheel's event. */
	public readonly onScrollReset:DelegateEvent<MouseWheelHandler> = new DelegateEvent<MouseWheelHandler>();
	//#endregion


	//#region Members
	/** The x (int) position of the mouse over canvas, in canvas coordinates. @readonly */
	public x:int = -1;

	/** The y (int) position of the mouse over canvas, in canvas coordinates. @readonly */
	public y:int = -1;

	/** Indicates if the mouse is currently over the game. @readonly */
	public isOver:boolean = false;

	/** The left (primary) mouse button. */
	public readonly left:MouseButton = new MouseButton();

	/** The right (secondary) mouse button. */
	public readonly right:MouseButton = new MouseButton();

	/** The middle (auxilery) mouse button. */
	public readonly middle:MouseButton = new MouseButton();

	/** The mouse wheel. */
	public readonly wheel:MouseWheel = new MouseWheel();

	/** Array of mouse buttons to work with. */
	public readonly buttons:ReadonlyArray<MouseButton> = [this.left, this.middle, this.right];

	/** The element we're listening for input on. */
	private _target:HTMLElement;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		// Bind
		this.target_move = this.target_move.bind(this);
		this.target_button = this.target_button.bind(this);
		this.target_wheel = this.target_wheel.bind(this);
		this.window_mouseUp = this.window_mouseUp.bind(this);
	}
	//#endregion


	//#region App Component
	/** @inheritdoc @internal */
	public initialize():void
	{
		// Grab the target
		this._target = GameWindow.element;

		// Start watching for input
		for (let evt of ["mouseover", "mousemove", "mouseout"]) this._target.addEventListener(evt, this.target_move, { capture: true, passive: true });
		for (let evt of ["mousedown", "mouseup"]) this._target.addEventListener(evt, this.target_button, { capture: true, passive: true });
		this._target.addEventListener("wheel", this.target_wheel, { capture: true, passive: false });			// Not passive because we want to be able to stop the wheel from scrolling the page if wheel.lock is set
		window.addEventListener("mouseup", this.window_mouseUp);												// Catches mouse ups when not over the canvas
	}

	/** @inheritdoc @internal */
	public deactivate():void
	{
		// Force release all buttons
		this.reset();
	}

	/** @inheritdoc @internal */
	public dispose():void
	{
		// Stop watching for input
		for (let evt of ["mouseover", "mousemove", "mouseout"]) this._target.removeEventListener(evt, this.target_move, <any>{ capture: true, passive: true });
		for (let evt of ["mousedown", "mouseup"]) this._target.removeEventListener(evt, this.target_button, <any>{ capture: true, passive: true });
		this._target.removeEventListener("wheel", this.target_wheel, <any>{ capture: true, passive: false });			// Not passive because we want to be able to stop the wheel from scrolling the page if wheel.lock is set
		window.removeEventListener("mouseup", this.window_mouseUp);														// Catches mouse ups when not over the canvas

		// Drop the target
		this._target = null;
	}
	//#endregion


	//#region Actions
	/**
	 * Cancels all mouse button presses and resets the mouse position.
	 */
	public reset():void
	{
		// Cancel button presses
		for (let i:int = 0; i < this.buttons.length; ++i) this.buttons[i].cancel();
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles mouse movement related events (mouseover, mouseout, mousemove).
	 * Also called privately to move the mouse to the correct position before handling button and scroll events.
	 * @param evt The mouse event.
	 */
	private target_move(evt:MouseEvent):void
	{
		if (!App.isActive) return;

		// Store old state so we can calculate changes
		let
		oldX:int = this.x,
		oldY:int = this.y,
		oldOver:boolean = this.isOver,
		forceMove:boolean = false;

		// Update state
		this.x = Math.round((evt.clientX - Stage.cssRect.x) * GameWindow.pixelRatio);
		this.y = Math.round((evt.clientY - Stage.cssRect.y) * GameWindow.pixelRatio);
		this.isOver = evt.type !== "mouseout" && (this.x >= 0 && this.x < Stage.width && this.y >= 0 && this.y < Stage.height);	// force out on mouseout event

		// Process Over
		if (!oldOver && this.isOver)
		{
			// Whenever we have a new enter, we should consider the move to be a 0 delta move to avoid massive movement deltas
			oldX = this.x;
			oldY = this.y;
			forceMove = true;
			if (this.onOver.count) this.onOver.invoke();
		}

		// Process Move
		if ((forceMove || (oldX !== this.x || oldY !== this.y)) && this.onMove.count) this.onMove.invoke(this.x - oldX, this.y - oldY);

		// Process Left
		if (oldOver && !this.isOver && this.onOut.count)
		{
			this.onOut.invoke();
		}

		// Stop propagation
		evt.stopPropagation();
	}

	/**
	 * Handles mouse button related events (mousedown, mouseup).
	 * @param evt The mouse event.
	 */
	private target_button(evt:MouseEvent):void
	{
		if (!App.isActive) return;

		// Simulate a move to the correct location because the mouse position may be invalid as a move event may have never fired
		this.target_move(evt);

		// Perform the button action
		if (evt.button < this.buttons.length)
		{
			let button:MouseButton = this.buttons[evt.button];
			if (evt.type === "mousedown")
			{
				if (this.isOver) button.press();
			}
			else
			{
				if (this.isOver) button.release();
				else button.cancel();
			}
		}
	}

	/**
	 * Handles mouse wheel related events (wheel).
	 * @param evt The wheel event.
	 */
	private target_wheel(evt:WheelEvent):void
	{
		if (!App.isActive) return;

		// Mouse wheel events require focus
		if (document.activeElement !== undefined && document.activeElement !== this._target) return;	// document.activeElement is not universally supported, will be undefined if unsupported and will be null/body if no selected element

		// Simulate a move to the correct location because the mouse position may be invalid as a move event may have never fired
		this.target_move(evt);

		// Perform the scroll action
		if (this.isOver)
		{
			if (evt.deltaY > 0) this.wheel.down(1, evt);
			else this.wheel.up(1, evt);

			// Prevent default if requested
			if (this.wheel.lock) evt.preventDefault();
		}
	}

	/**
	 * Handles when the mouse is released at any time, over the target or not so we can catch cancel releases.
	 * NOTE: this must be called AFTER the target events, so ensure that captures are set up properly.
	 * @param evt The mouse event.
	 */
	protected window_mouseUp(evt:MouseEvent):void
	{
		if (evt.button < this.buttons.length) this.buttons[evt.button].cancel();
	}
	//#endregion

})();
