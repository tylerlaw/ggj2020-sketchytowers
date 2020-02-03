/** @file MouseWheel.ts */

/**
 * Handler interface for general mouse wheel events.
 * @param mouseWheel This mouse wheel that fired the event.
 */
interface MouseWheelHandler { (mouseWheel:MouseWheel):void; }

/**
 * Handler interface for mouse wheel scroll events.
 * @param mouseWheel This mouse wheel that fired the event.
 * @param dScroll The delta of the scroll wheel event, the amount of change!
 * @param evt The mouse wheel event, passed to preventDefault may be called if needed.
 */
interface MouseWheelScrollHandler { (mouseWheel:MouseWheel, dScroll:number, evt?:WheelEvent):void; }

/**
 * Wraps mouse wheel input.
 */
class MouseWheel
{
	//#region Events
	/** Fired when the wheel is scrolled. Fired AFTER the mouse's event and only if not reset. */
	public readonly onScroll:DelegateEvent<MouseWheelScrollHandler> = new DelegateEvent<MouseWheelScrollHandler>();
	
	/** Fired when the wheel scroll is reset. Fired AFTER the mouse's event and only if not reset. */
	public readonly onScrollReset:DelegateEvent<MouseWheelHandler> = new DelegateEvent<MouseWheelHandler>();
	//#endregion


	//#region Members
	/** Indicates if mouse wheel scroll is prevented when the game canvas has focus. Default False. */
	public lock:boolean = true;

	/** The amount the wheel is scrolled, positive numebrs means down, negative is up. Note that wheel scroll requires canvas focus just like keyboard. @readonly */
	public scroll:int = 0;

	/** Helper to track when the wheel is in a reset state */
	private _reset:boolean = true;
	//#endregion


	//#region Constructor
	/** @sealed */
	public constructor() {}
	//#endregion


	//#region Actions
	/**
	 * Scrolls the mouse wheel down.
	 * @param delta The amount to scroll the mouse wheel down. Should be positive.
	 * @param evt The wheel event so prevent default can be called if needed.
	 * @internal
	 */
	public down(delta:int, evt?:WheelEvent):void
	{
		this._reset = false;

		this.scroll += delta;

		Mouse.onScroll.invoke(this, delta, evt);
		if (!this._reset) this.onScroll.invoke(this, delta, evt);
	}

	/**
	 * Scrolls the mouse wheel up.
	 * @param delta The amount to scroll the mouse wheel up. Should be negative.
	 * @internal
	 */
	public up(delta:int, evt?:WheelEvent):void
	{
		this._reset = false;

		this.scroll -= delta;

		Mouse.onScroll.invoke(this, delta, evt);
		if (!this._reset) this.onScroll.invoke(this, delta, evt);
	}

	/**
	 * Resets the total amount of scroll of the mouse wheel.
	 */
	public reset():void
	{
		this._reset = true;

		this.scroll = 0;

		Mouse.onScrollReset.invoke(this);
		this.onScrollReset.invoke(this);
	}
	//#endregion
}
