/** @file Button.ts */

/// <reference path="Sprite.ts" />
/// <reference path="../sound/Sound.ts" />

/** Enumeration of button states. */
const enum ButtonState
{
	/** The up state (not over). */
	Up,

	/** The over state (over but not down). */
	Over,

	/** The down state (over and down). */
	Down
}

/**
 * The base button class.
 */
class Button<V = any> extends Sprite
{
	//#region Button State
	/** The current button state. */
	private _state:ButtonState = ButtonState.Up;

	public isPressed:boolean = false;

	protected isOver:boolean = false;

	/** The click sound. */
	public clickSound:Sound = null;
	//#endregion


	//#region Value
	/** An optional value set at the button. */
	public value:V = null;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Button.
	 */
	public constructor()
	{
		super();

		this.cursor = Cursor.Pointer;

		this.input = new DisplayInputComponent(this);

		this.input.onPointerRollOver.add(this.this_onRollOver, this);
		this.input.onPointerRollOut.add(this.this_onRollOut, this);
		this.input.onPointerPress.add(this.this_onMousePress, this);
		this.input.onPointerCancel.add(this.this_onMouseCancel, this);
		this.input.onPointerRelease.add(this.this_onMouseRelease, this);
		this.input.onPointerClick.add(this.this_onPointerClick, this);
	}
	//#endregion


	//#region Button State
	/**
	 * Updates the current button state.
	 */
	private updateButtonState():void
	{
		if (!this.isOver)
		{
			if (this._state !== ButtonState.Up) this.up();
		}
		else if (this.isPressed)
		{
			if (this._state !== ButtonState.Down) this.down();
		}
		else
		{
			if (this._state !==  ButtonState.Over) this.over();
		}
	}

	/**
	 * Updates button state to up.
	 */
	protected up():void
	{
		this._state = ButtonState.Up;
	}

	/**
	 * Update button state to down.
	 */
	protected down():void
	{
		this._state = ButtonState.Down;
	}

	/**
	 * Update button state to over.
	 */
	protected over():void
	{
		this._state = ButtonState.Over;
	}
	//#endregion


	//#region Event Handlers
	/** Handles Pointer event changes. */
	private this_onRollOver(current:Sprite, target:Sprite):void
	{
		this.isOver = true;
		this.updateButtonState();
	}

	/** Handles Pointer event changes. */
	private this_onRollOut(current:Sprite, target:Sprite):void
	{
		this.isOver = false;
		this.updateButtonState();
	}

	/** Handles Pointer event changes. */
	private this_onMousePress(current:Sprite, target:Sprite):void
	{
		this.isPressed = true;
		this.updateButtonState();
	}

	/** Handles Pointer event changes. */
	private this_onMouseCancel(current:Sprite, target:Sprite):void
	{
		this.isPressed = false;
		this.updateButtonState();
	}

	/** Handles Pointer event changes. */
	private this_onMouseRelease(current:Sprite, target:Sprite):void
	{
		this.isPressed = false;
		this.updateButtonState();
	}

	/** Handles pointer click events. */
	private this_onPointerClick(current:Sprite, target:Sprite):void
	{
		if (this.clickSound)
		{
			this.clickSound.stop();
			this.clickSound.play();
		}
	}
	//#endregion
}
