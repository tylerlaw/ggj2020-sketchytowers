/** @file Keyboard.ts */

/// <reference path="KeyboardKeySet.ts" />

/**
 * Handler interface for mouse button delegate events.
 * @param keyboardKey This mouse button that fired the actions.
 * @param character The character of the key.
 * @param evt The underlying keyboard event.
 */
interface KeyboardInputHandler { (keyboardKey:KeyboardKey, character:string, evt:KeyboardEvent):void; }

/**
 * AppComponent for working with keyboard input and state.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const Keyboard = new (class
{
	//#region Events
	/** fired when a keyboard key is pressed. */
	public readonly onPress:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** fired when a keyboard key is repeated. */
	public readonly onRepeat:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** fired when a keyboard key is released. */
	public readonly onRelease:DelegateEvent<KeyboardInputHandler> = new DelegateEvent<KeyboardInputHandler>();

	/** fired when a keyboard key is canceled. */
	public readonly onCancel:DelegateEvent<KeyboardKeyHandler> = new DelegateEvent<KeyboardKeyHandler>();
	//#endregion


	//#region Members
	/** The set of all keyboard keys. */
	public readonly keys:KeyboardKeySet = <any>{};

	/** Map of lowercase KeyboardEvent::key values to Keys. */
	private readonly _nameToKey:Dictionary<KeyboardKey> = {};

	/** Array of all keys. @internal */
	public readonly keyList:KeyboardKey[] = [];

	/** The element we're listening for input on. */
	protected _target:HTMLElement;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		// Bind
		this.reset = this.reset.bind(this);						// Handles resetting events (blur, onFullscreenChange)
		this.target_keyDown = this.target_keyDown.bind(this);
		this.target_keyUp = this.target_keyUp.bind(this);

		// Init keys
		// If just a character, lowercase versions are added to the map, the single character is the prop name
		// If an array, lower case versions of each are added to the map, the first entry is the prop name
		let
		key:KeyboardKey, i:int, j:int, names:string[],
		keyData:any[] = [
			"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
			["Num0", "0"], ["Num1", "1"], ["Num2", "2"], ["Num3", "3"], ["Num4", "4"], ["Num5", "5"], ["Num6", "6"], ["Num7", "7"], ["Num8", "8"], ["Num9", "9"],
			["Left", "ArrowLeft"], ["Up", "ArrowUp"], ["Right", "ArrowRight"], ["Down", "ArrowDown"],
			"PageUp", "PageDown",
			"Home", "End",
			"Shift",
			"Tab",
			["Space", " "],
			"Enter",
			["Escape", "Esc"],			// Escape Key - BEWARE using this, it cannot be prevented. IF in fullscreen, it will exit fullscreen.
			"Backspace",
			"Delete",
			"CapsLock",
			["Ctrl", "Control"],
			"Alt",
			"OS",						// Windows key
			["Tilde", "`", "~"],
			["Backslash", "\\", "|"]
			//"F11"						// Reserved for toggling fullscreen
		];
		for (i = 0; i < keyData.length; ++i)
		{
			names = typeof keyData[i] === "string" ? [keyData[i]] : keyData[i];						// convert to array if just a single string
			(<any>this.keys)[names[0]] = key = new KeyboardKey(names[0]);					// create and assign to prop
			for (j = 0; j < names.length; ++j) this._nameToKey[names[j].toLowerCase()] = key;		// add to map under all names
			this.keyList.push(key);																	// add to list
		}
	}
	//#endregion


	//#region App Component
	/** @inheritdoc @internal */
	public initialize():void
	{
		// Grab the target
		this._target = GameWindow.element;

		// Start watching for input
		this._target.addEventListener("keydown", this.target_keyDown);
		this._target.addEventListener("keyup", this.target_keyUp);

		// Start watching for resetting events
		this._target.addEventListener("blur", this.reset);

		App.onFullscreenChange.add(this.reset, this);
	}

	/** @inheritdoc @internal */
	public deactivate():void
	{
		// Cancel all key presses
		this.reset();
	}

	/** @inheritdoc @internal */
	public dispose():void
	{
		// Stop watching for resetting events
		this._target.removeEventListener("blur", this.reset);
		App.onFullscreenChange.remove(this.reset, this);

		// Stop watching for input
		this._target.removeEventListener("keydown", this.target_keyDown);
		this._target.removeEventListener("keyup", this.target_keyUp);

		// Drop the target
		this._target = null;
	}
	//#endregion


	//#region Actions
	/**
	 * Cancels all current key presses.
	 */
	public reset():void
	{
		for (let i:number = 0; i < this.keyList.length; ++i) this.keyList[i].cancel();
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles key presses and repeats.
	 * @param evt The key event.
	 */
	private target_keyDown(evt:KeyboardEvent):void
	{
		if (!App.isActive || evt.key === undefined) return;	// KeyboardEvent::key isn't 100% supported

		let key:KeyboardKey = this._nameToKey[evt.key.toLowerCase()];
		if (key)
		{
			if (key.isPressed)
			{
				key.repeat(evt.key, evt);
			}
			else
			{
				if (key.onPress.count > 0) evt.stopImmediatePropagation();	// I think this is here to prevent the page from handling presses the game is handling
				key.press(evt.key, evt);
			}
		}
	}

	/**
	 * Handles key releases.
	 * @param evt The key event.
	 */
	protected target_keyUp(evt:KeyboardEvent):void
	{
		if (!App.isActive || evt.key === undefined) return;	// KeyboardEvent::key isn't 100% supported

		let key:KeyboardKey = this._nameToKey[evt.key.toLowerCase()];
		if (key && key.isPressed)
		{
			key.release(evt.key, evt);
		}
	}
	//#endregion
})();
