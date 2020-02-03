/** @file TouchScreen.ts */

/// <reference path="TouchPoint.ts" />

/**
 * Provides an interface for working with touch input.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const TouchScreen = new (class
{
	//#region Members
	/** The set of touch points that the touch screen can handle. */
	public readonly points:ReadonlyArray<TouchPoint>;

	/** The element we're listening for input on. */
	private _target:HTMLElement;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		// Bind functions
		this.reset = this.reset.bind(this);								// used to reset state on blur / fullscreen change
		this.target_touchEvt = this.target_touchEvt.bind(this);
		this.target_touchCancel = this.target_touchCancel.bind(this);

		// Init touch points
		let maxTouchPoints:number = 10;
		if (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints !== null && navigator.maxTouchPoints !== 0) maxTouchPoints = navigator.maxTouchPoints;
		else if (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints !== null && navigator.msMaxTouchPoints !== 0) maxTouchPoints = navigator.msMaxTouchPoints;
		// tslint:disable-next-line: no-console
		else console.info("Max touch points undefined, defaulting to 10.");
		let points:TouchPoint[] = [];
		for (let i:number = 0; i < maxTouchPoints; ++i) points.push(new TouchPoint(i));
		this.points = points;
	}
	//#endregion


	//#region App Component
	/** @inheritdoc @internal */
	public initialize():void
	{
		// Grab the target
		this._target = GameWindow.element;

		// Start watching for input
		this._target.addEventListener("touchstart", this.target_touchEvt, { capture: true, passive: false });
		this._target.addEventListener("touchmove", this.target_touchEvt, { capture: true, passive: true });
		this._target.addEventListener("touchend", this.target_touchEvt, { capture: true, passive: false });
		this._target.addEventListener("touchcancel", this.target_touchCancel);

		// Start watching for resetting events
		this._target.addEventListener("blur", this.reset);
		App.onFullscreenChange.add(this.reset, this);
	}

	/** @inheritdoc @internal */
	public deactivate():void
	{
		// Cancel all touches
		this.reset();
	}

	/** @inheritdoc @internal */
	public dispose():void
	{
		// Stop watching for resetting events
		this._target.removeEventListener("blur", this.reset);
		App.onFullscreenChange.remove(this.reset, this);

		// Stop watching for input
		this._target.removeEventListener("touchstart", this.target_touchEvt, <any>{ capture: true, passive: false });
		this._target.removeEventListener("touchmove", this.target_touchEvt, <any>{ capture: true, passive: true });
		this._target.removeEventListener("touchend", this.target_touchEvt, <any>{ capture: true, passive: false });
		this._target.removeEventListener("touchcancel", this.target_touchCancel);

		// Drop the target
		this._target = null;
	}
	//#endregion


	//#region Actions
	/**
	 * Cancels all touchscreen touch points.
	 */
	public reset():void
	{
		for (let i:number = 0; i < this.points.length; ++i) this.points[i].cancel();
	}
	//#endregion


	//#region Helpers
	/**
	 * Returns a TouchPoint for the given identifier.
	 * @param identifier The system assigned identifier of the touch point.
	 * @return The appropriate touch point.
	 */
	private fetch(identifier:number):TouchPoint
	{
		let point:TouchPoint = null;
		let empty:TouchPoint = null;

		// Iterate over the touch point list finding one that has a matching identifier and the first "empty" touch point
		for (let i:number = 0; i < this.points.length; ++i)
		{
			if (this.points[i].identifier === identifier)
			{
				point = this.points[i];
				break;
			}
			else if (empty === null && this.points[i].identifier === undefined)
			{
				empty = this.points[i];
			}
		}

		if (point === null && empty !== null)
		{
			point = empty;
			point.identifier = identifier;
		}

		return point;
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles touch action events (touchstart, touchmove, touchend)
	 * @param evt The touch event.
	 */
	protected target_touchEvt(evt:TouchEvent):void
	{
		if (!App.isActive) return;

		const touchList:TouchList = evt.changedTouches;
		for (let i:number = 0; i < touchList.length; ++i)
		{
			let touch:Touch = touchList[i];

			let touchPoint:TouchPoint = this.fetch(touch.identifier);
			if (touchPoint)
			{
				touchPoint.move(
					Math.round((touch.clientX - Stage.cssRect.x) * GameWindow.pixelRatio),
					Math.round((touch.clientY - Stage.cssRect.y) * GameWindow.pixelRatio)
				);

				if (evt.type === "touchstart") touchPoint.press();
				else if (evt.type === "touchend") touchPoint.release();
			}
		}

		if (evt.type === "touchstart")
		{
			//if (!GameWindow.allowPageScrolling && evt.cancelable) evt.preventDefault();	// Prevent scrolling and gestures, we only want to do this if expanded or expansion in not required in the current state
		}
		else if (evt.type === "touchend")
		{
			if (evt.cancelable) evt.preventDefault();						// Prevent mouse emulation
			evt.stopPropagation();						// Prevent page from seeing the touch end?
		}
	}

	/**
	 * Handles when a touch is canceled.
	 * @param evt The touch event.
	 */
	protected target_touchCancel(evt:TouchEvent):void
	{
		const touchList:TouchList = evt.changedTouches;
		for (let i:number = 0; i < touchList.length; ++i)
		{
			let touch:Touch = touchList[i];

			let touchPoint:TouchPoint = this.fetch(touch.identifier);
			if (touchPoint) touchPoint.cancel();
		}
	}
	//#endregion
})();
