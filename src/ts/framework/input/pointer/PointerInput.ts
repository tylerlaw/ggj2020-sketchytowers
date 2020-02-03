/** @file PointerInput.ts */

/// <reference path="Pointer.ts" />

/**
 * AppComponent for working with unified mouse & touch "pointer" input and state.
 * The first pointing device (touch point 0 or mouse) to be pressed is given active control if it is available
 * Mouse has "passive" control otherwise
 * @staticclass
 */
// tslint:disable-next-line: typedef
const PointerInput = new (class
{
	//#region Members
	/** The set of pointers that can be controlled with pointer input. @readonly */
	public readonly pointers:ReadonlyArray<Pointer>;

	/** A reference to the primary pointer (index=0) that can be controlled by mouse or touch. */
	public readonly primary:Pointer;
	
	private _mouseControl:boolean = false;
	private _touchPointControl:boolean = false;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		// Create pointers
		let pointers:Pointer[] = [];
		pointers.push(new Pointer(0));
		for (let i:number = 1; i < TouchScreen.points.length; ++i) pointers.push(new Pointer(i));
		this.pointers = pointers;
		this.primary = this.pointers[0];
	}
	//#endregion


	//#region App Component
	/** @inheritdoc @internal */
	public initialize():void
	{
		// Start watching for input events
		Mouse.onMove.add(this.Mouse_onMove, this);
		Mouse.left.onPress.add(this.Mouse_left_onPress, this);
		Mouse.left.onRelease.add(this.Mouse_left_onRelease, this);
		Mouse.left.onCancel.add(this.Mouse_left_onCancel, this);
		Mouse.onOver.add(this.Mouse_onOver, this);
		Mouse.onOut.add(this.Mouse_onOut, this);
		for (let i:number = 0; i < TouchScreen.points.length; ++i)
		{
			TouchScreen.points[i].onPress.add(this.touchPoint_onPress, this);
			TouchScreen.points[i].onMove.add(this.touchPoint_onMove, this);
			TouchScreen.points[i].onRelease.add(this.touchPoint_onRelease, this);
			TouchScreen.points[i].onCancel.add(this.touchPoint_onCancel, this);
		}

		// The mouse should immediately pickup passive control
		if (Mouse.isOver)
		{
			this.primary.move(Mouse.x, Mouse.y);
			this.primary.present();
		}
		else
		{
			this.primary.absent();
		}
	}

	/** @inheritdoc @internal */
	public dispose():void
	{
		// Stop watching for input events
		Mouse.onMove.remove(this.Mouse_onMove, this);
		Mouse.left.onPress.remove(this.Mouse_left_onPress, this);
		Mouse.left.onRelease.remove(this.Mouse_left_onRelease, this);
		Mouse.left.onCancel.remove(this.Mouse_left_onCancel, this);
		Mouse.onOver.remove(this.Mouse_onOver, this);
		Mouse.onOut.remove(this.Mouse_onOut, this);
		for (let i:number = 0; i < TouchScreen.points.length; ++i)
		{
			TouchScreen.points[i].onPress.remove(this.touchPoint_onPress, this);
			TouchScreen.points[i].onMove.remove(this.touchPoint_onMove, this);
			TouchScreen.points[i].onRelease.remove(this.touchPoint_onRelease, this);
			TouchScreen.points[i].onCancel.remove(this.touchPoint_onCancel, this);
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles a mouse move.
	 * @param dx The x move delta.
	 * @param dy The y move delta.
	 */
	private Mouse_onMove(dx:number, dy:number):void
	{
		// TODO: FUTURE- This doesn't handle massive movement deltas well
		// Mouse is a passive controller so it will update the pointer any time the touch screen isn't in control
		if (!this._touchPointControl)
		{
			// Update
			this.primary.move(Mouse.x, Mouse.y);
		}
	}

	/**
	 * Handles when the mouse leaves the canvas.
	 */
	private Mouse_onOver():void
	{
		// TODO: FUTURE- This would force a drop of the mouse leaves the game window, maybe want to add something to check if the mouse is down
		if (!this._touchPointControl)
		{
			this.primary.present();
		}
	}

	/**
	 * Handles when the mouse enters the canvas.
	 */
	private Mouse_onOut():void
	{
		if (!this._touchPointControl)
		{
			this.primary.absent();
		}
	}

	/**
	 * Handles left mouse button presses.
	 * @param button The left mouse button.
	 */
	private Mouse_left_onPress(button:MouseButton):void
	{
		// The mouse can only gain control if the pointer is not in control
		if (!this._touchPointControl)
		{
			// Gain control
			this._mouseControl = true;

			// Update
			this.primary.move(Mouse.x, Mouse.y);
			this.primary.press();
		}
	}

	/**
	 * Handles left mouse button releases.
	 * @param button The left mouse button.
	 */
	private Mouse_left_onRelease(button:MouseButton):void
	{
		// Only handle mouse releases if under mouse control
		if (this._mouseControl)
		{
			// Lose control
			this._mouseControl = false;

			// Update
			this.primary.move(Mouse.x, Mouse.y);
			this.primary.release();
		}
	}

	/**
	 * Handles left mouse button cancels.
	 * @param button The left mouse button.
	 */
	private Mouse_left_onCancel(button:MouseButton):void
	{
		// Only handle mouse cancels if under mouse control
		if (this._mouseControl)
		{
			// Lose control
			this._mouseControl = false;

			// Update
			this.primary.move(Mouse.x, Mouse.y);
			this.primary.cancel();
		}
	}

	/**
	 * Handles a touch point press.
	 * @param touchPoint The touch point.
	 */
	private touchPoint_onPress(touchPoint:TouchPoint):void
	{
		if (touchPoint.index > 0)
		{
			this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
			this.pointers[touchPoint.index].present();
			this.pointers[touchPoint.index].press();
		}
		else
		{
			// If the touch point is not under mouse control, then the touch can take it
			if (!this._mouseControl)
			{
				// Take control
				this._touchPointControl = true;
				
				// Move
				this.primary.move(touchPoint.x, touchPoint.y);
				this.primary.present();
				this.primary.press();
			}
		}
	}

	/**
	 * Handles touch point moves.
	 * @param touchPoint The touch point.
	 * @param dx The x movement delta.
	 * @param dy The y movement delta.
	 */
	private touchPoint_onMove(touchPoint:TouchPoint, dx:number, dy:number):void
	{
		if (touchPoint.index > 0)
		{
			this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
		}
		else
		{
			// Only move if the mouse isn't the active or passive controller
			if (this._touchPointControl)
			{
				this.primary.move(touchPoint.x, touchPoint.y);
			}
		}
	}

	/**
	 * Handles a touch point release.
	 * @param touchPoint The touch point.
	 */
	private touchPoint_onRelease(touchPoint:TouchPoint):void
	{
		if (touchPoint.index > 0)
		{
			this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
			this.pointers[touchPoint.index].release();
			this.pointers[touchPoint.index].absent();
		}
		else
		{
			// Only handle releases if we are under control by the touch point
			if (this._touchPointControl)
			{
				// Lose control
				this._touchPointControl = false;

				// Update
				this.primary.move(touchPoint.x, touchPoint.y);
				this.primary.release();

				// Revert to mouse position or behave as a touch point
				if (Mouse.isOver)
				{
					this.primary.move(Mouse.x, Mouse.y);
				}
				else
				{
					this.primary.absent();
				}
			}
		}
	}

	/**
	 * Handles a touch point cancel.
	 * @param touchPoint The touch point.
	 */
	private touchPoint_onCancel(touchPoint:TouchPoint):void
	{
		if (touchPoint.index > 0)
		{
			this.pointers[touchPoint.index].move(touchPoint.x, touchPoint.y);
			this.pointers[touchPoint.index].cancel();
			this.pointers[touchPoint.index].absent();
		}
		else
		{
			// Only handle cancels if we are under control by the touch point
			if (this._touchPointControl)
			{
				// Lose control
				this._touchPointControl = false;

				// Update
				this.primary.move(touchPoint.x, touchPoint.y);
				this.primary.cancel();

				// Revert to mouse position or behave as a touch point
				if (Mouse.isOver)
				{
					this.primary.move(Mouse.x, Mouse.y);
				}
				else
				{
					this.primary.absent();
				}
			}
		}
	}
	//#endregion
})();
