/** @file MouseButton.ts */

/** Handler interface for mouse button delegate events.
 * @param mouseButton This mouse button that fired the actions.
 */
interface MouseButtonHandler { (mouseButton:MouseButton):void; }

/**
 * Wraps a mouse button.
 */
class MouseButton
{
	//#region Events
	/** Fired when a mouse button is pressed down. Fired AFTER the mouse's event and only if state hasn't changed. */
	public readonly onPress:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();

	/** Fired when a mouse button is released. Fired AFTER the mouse's event. */
	public readonly onRelease:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();

	/** Fired when a mouse button press is canceled. Fired AFTER the mouse's event. */
	public readonly onCancel:DelegateEvent<MouseButtonHandler> = new DelegateEvent<MouseButtonHandler>();
	//#endregion

	//#region Members
	/** Indicates if the mouse button is currently pressed. @readonly */
	public isPressed:boolean = false;
	//#endregion


	//#region Constructor
	/** @sealed */
	public constructor() {}
	//#endregion


	//#region Actions
	/**
	 * Presses the mouse button.
	 * @internal
	 */
	public press():void
	{
		if (this.isPressed) return;
		this.isPressed = true;

		Mouse.onPress.invoke(this);
		if (this.isPressed) this.onPress.invoke(this);
	}

	/**
	 * Releases the mouse button.
	 * @internal
	 */
	public release():void
	{
		if (!this.isPressed) return;
		this.isPressed = false;

		Mouse.onRelease.invoke(this);
		this.onRelease.invoke(this);
	}

	/**
	 * Cancels a current press if any.
	 */
	public cancel():void
	{
		if (!this.isPressed) return;
		this.isPressed = false;

		Mouse.onCancel.invoke(this);
		this.onCancel.invoke(this);
	}
	//#endregion
}
