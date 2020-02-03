/** @file TouchPoint.ts */

/** A delegate interface for handling touch point events. */
interface TouchPointHandler { (touchPoint:TouchPoint):void; }

/** A delegate interface for handling touch point moves. */
interface TouchPointMoveHandler { (touchPoint:TouchPoint, dx:number, dy:number):void; }

/**
 * TouchPoint internal implementation.
 */
class TouchPoint
{
	//#region Events
	/** Fired when the touch point is pressed. */
	public readonly onPress:DelegateEvent<TouchPointHandler> = new DelegateEvent<TouchPointHandler>();

	/** Fired when the touch point moves. */
	public readonly onMove:DelegateEvent<TouchPointMoveHandler> = new DelegateEvent<TouchPointMoveHandler>();

	/** Fired when the touch point is released. */
	public readonly onRelease:DelegateEvent<TouchPointHandler> = new DelegateEvent<TouchPointHandler>();

	/** Fired when the touch point is canceled. */
	public readonly onCancel:DelegateEvent<TouchPointHandler> = new DelegateEvent<TouchPointHandler>();
	//#endregion
	

	//#region Members
	/** The index of this touch point in the touchscreen's touch point list. */
	public readonly index:int;

	/** The last known x position of the touch point in canvas coords. @readony */
	public x:int = 0;

	/** The last known y position of the touch point in canvas coords. @readony */
	public y:int = 0;

	/** Indicates if this touch point is currently pressed or not. @readonly */
	public isPressed:boolean = false;

	/** The system identifier of this touch point. Should be undefined when the touch point is not active. @internal */
	public identifier:number = undefined;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new TouchPoint.
	 * @param index The index of the touch point in the touchscreen touch point list.
	 * @sealed
	 */
	public constructor(index:int)
	{
		this.index = index;
	}
	//#endregion


	//#region Actions
	/**
	 * Handles when a touch point is pressed.
	 * @internal
	 */
	public press():void
	{
		if (this.isPressed) return;
		this.isPressed = true;
		if (this.onPress.count) this.onPress.invoke(this);
	}

	
	/**
	 * Handles when a touch point is moved.
	 * @param x The touch point x position in canvas space.
	 * @param y The touch point y position in canvas space.
	 * @internal
	 */
	public move(x:number, y:number):void
	{
		if (this.x !== x || this.y !== y)
		{
			const dx:number = x - this.x;
			const dy:number = y - this.y;

			this.x = x;
			this.y = y;

			if (this.isPressed && this.onMove.count) this.onMove.invoke(this, dx, dy);
		}
	}

	/**
	 * Handles when a touch point is released.
	 * @internal
	 */
	public release():void
	{
		this.identifier = undefined;
		if (!this.isPressed) return;
		this.isPressed = false;
		if (this.onRelease.count) this.onRelease.invoke(this);
	}

	/**
	 * Cancels the current press if any.
	 */
	public cancel():void
	{
		this.identifier = undefined;
		if (!this.isPressed) return;
		this.isPressed = false;
		if (this.onCancel.count) this.onCancel.invoke(this);
	}
	//#endregion
	
}
