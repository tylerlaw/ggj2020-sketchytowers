/** @file KeyboardKey.ts */

/** Delegate Interfaces */
/**
 * Handler interface for keyboard button delegate events.
 * @param keyboardKey This keyboard button that fired the actions.
 */
interface KeyboardKeyHandler { (keyboardKey:KeyboardKey):void; }

/**
 * Internal interface for the KeyboardKey class.
 */
class KeyboardKey
{
	//#region Events
	/** Fired when a key is pressed down. Fired AFTER the keyboard's event and only if the key state still matches. */
	public readonly onPress:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** Fired when a key is repeated when pressed down. Fired AFTER the keyboard's event and only if the key state still matches. */
	public readonly onRepeat:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** Fired when a key is released. Fired AFTER the keyboard's event. */
	public readonly onRelease:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** Fired when a key press is canceled. Fired AFTER the keyboard's event. */
	public readonly onCancel:DelegateEvent<KeyboardKeyHandler> = new DelegateEvent<KeyboardKeyHandler>();
	//#endregion


	//#region Members
	/** Indicates if the mouse button is currently pressed. @readonly */
	public isPressed:boolean = false;

	/** The name of the key. */
	public readonly name:string;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new keyboard key.
	 * @param name The name of the key.
	 * @sealed
	 */
	public constructor(name:string)
	{
		this.name = name;
	}
	//#endregion


	//#region Actions
	/**
	 * Presses the key.
	 * @internal
	 */
	public press(character:string, evt:KeyboardEvent):void
	{
		if (this.isPressed) return;
		this.isPressed = true;

		Keyboard.onPress.invoke(this, character, evt);
		if (this.isPressed) this.onPress.invoke(this, character, evt);
	}

	/**
	 * Repeats the key.
	 * @internal
	 */
	public repeat(character:string, evt:KeyboardEvent):void
	{
		if (!this.isPressed) return;
		this.isPressed = true;

		Keyboard.onRepeat.invoke(this, character, evt);
		if (this.isPressed) this.onRepeat.invoke(this, character, evt);
	}

	/**
	 * Releases the key.
	 * @internal
	 */
	public release(character:string, evt:KeyboardEvent):void
	{
		if (!this.isPressed) return;
		this.isPressed = false;

		Keyboard.onRelease.invoke(this, character, evt);
		this.onRelease.invoke(this, character, evt);
	}

	/**
	 * Cancels a current press if any.
	 */
	public cancel():void
	{
		if (!this.isPressed) return;
		this.isPressed = false;

		Keyboard.onCancel.invoke(this);
		this.onCancel.invoke(this);
	}
	//#endregion
}
