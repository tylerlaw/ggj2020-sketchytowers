/** @file GameScreen.ts */

/// <reference path="../lang/delegate/DelegateEvent.ts" />
/// <reference path="GameScreenManager.ts" />

/** Handler interface for screen events. */
interface GameScreenHandler { (screen:GameScreen):void; }

/**
 * A GameScreen describes a visual and input based game state.
 */
class GameScreen
{
	//#region Static Members
	/** Helper value which will cause this screen to print out its screen state when it changes. */
	protected static _debug:boolean = false;
	//#endregion
	
	
	//#region Events
	/** Invoked whenever the screen is removed from the screen manager. */
	public onRemoved:DelegateEvent<GameScreenHandler> = new DelegateEvent<GameScreenHandler>();
	//#endregion
	

	//#region GameScreen State
	/** Indicates if this screen disallows input to be passed down to screens below it. default true. */
	public get isModal():boolean { return this._isModal; }
	public set isModal(v:boolean) { this._isModal = v; }
	private _isModal:boolean = true;
	
	/** Indicates if this screen a transparent or opaque (hides things below it). default false. */
	public get isPopup():boolean { return this._isPopup; }
	public set isPopup(v:boolean) { this._isPopup = v; }
	private _isPopup:boolean = false;

	/** Indicates if this screen is accepting input. */
	public get inputEnabled():boolean { return this._inputEnabled; }
	public set inputEnabled(v:boolean)
	{
		if (this._inputEnabled === v) return;
		this._inputEnabled = v;
		this.refreshInputState();
	}
	private _inputEnabled:boolean = true;

	/** Indicates if the screen is currently added to the screen manager. */
	public get isActive():boolean { return this._isActive; }
	private readonly _isActive:boolean = false;						// Set by screen manager
	
	/** Indicates if this screen is currently the top most screen handling input. */
	public get isFocused():boolean { return this._isFocused; }
	private _isFocused:boolean = false;
	
	/** Indicates if this screen is currently being shown and not covered by any other opaque screens. default true. */
	public get isOccluded():boolean { return this._isOccluded; }
	private _isOccluded:boolean = true;
	
	/** Indicates if the screen has been initialized or not. */
	private _isInitialized:boolean = false;

	/** Indicates if this screen is currently allowed to accept input based on its position in the stack. */
	private readonly _isInputAllowed:boolean = false;				// Set by screen manager
	
	/**  Indicates if this screen is currently exiting. */
	public get isExiting():boolean { return this._isExiting; }
	private _isExiting:boolean = false;
	
	/** Indicates if this screen is currently disposed */
	public get isDisposed():boolean { return this._isDisposed; }
	private _isDisposed:boolean = false;
	
	/** The display object used to render this screen's contents. */
	public get display():Sprite { return this._display; }
	private _display:Sprite = new Sprite();
	
	/** The screen manager this screen is on. */
	public screenManager:GameScreenManager = null;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new screen.
	 */
	public constructor()
	{
		this._display.name = this.toString();
		this._display.input = new DisplayInputComponent(this._display);
		this._display.visible = false;
		this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = false;
	}
	//#endregion


	//#region Initialization
	/**
	 * This method is called when the screen is first added to the screen manager the first time.
	 */
	protected initialize():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("initialize: " + this);
		
		this._isInitialized = true;
	}
	//#endregion
	

	//#region Dispose
	/**
	 * You may call this method to permanently mark a screen as garbage.
	 */
	public dispose():void
	{
		this._isDisposed = true;
		
		this._display = null;
	}
	//#endregion


	//#region Added / Removed
	/**
	 * Called whenever the screen is added to the screen manager.
	 */
	protected added():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("added: " + this);
	}
	
	/**
	 * Called whenever the screen is removed from the screen manager.
	 */
	protected removed():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("removed: " + this);
	}
	//#endregion


	//#region Exiting
	/**
	 * Call to have the screen be removed from the screen manager.
	 */
	public exit():void
	{
		if (!this._isActive) return;
		if (this._isExiting) return;
		this._isExiting = true;
		this.screenManager.remove(this);	// internal access
	}
	//#endregion

	
	//#region Focus
	/**
	 * Function gets called whenever the screen gains focus.
	 */
	protected gainFocus():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("gainFocus: " + this);
		
		this._isFocused = true;
	}
	
	/**
	 * Function gets called whenever the screen loses focus.
	 */
	protected loseFocus():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("loseFocus: " + this);
		
		this._isFocused = false;
	}
	//#endregion
	
	
	//#region Occlusion
	/**
	 * Function gets called whenever a screen is set to be shown.
	 */
	protected show():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("show: " + this);
		
		this._isOccluded = false;
		this._display.visible = true;
	}
	
	/**
	 * Function gets called whenever a screen is set to be hidden.
	 */
	protected hide():void
	{
		// tslint:disable-next-line: no-console
		if (GameScreen._debug) console.info("hide: " + this);
		
		this._isOccluded = true;
		this._display.visible = false;
	}
	//#endregion
	
	
	//#region Input
	/**
	 * This method is called by the screen manager whenever screen input enabled / allowed changes.
	 */
	private refreshInputState():void
	{
		if (this._isInputAllowed && this._inputEnabled)
		{
			this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = true;
		}
		else
		{
			this._display.input.pointerEnabled = this._display.input.pointerChildrenEnabled = false;
		}
	}
	//#endregion
	
	
	//#region Updating
	/**
	 * Override to add update logic.
	 * @param elapsed The amount of time that has passed since the last update.
	 */
	public update(elapsed:number):void
	{
		
	}
	//#endregion

	
	//#region Drawing
	/**
	 * Override to add custom post-update & pre-render logic.
	 */
	public draw():void
	{
		
	}
	//#endregion
	

	//#region Debug
	/**
	 * Gets a debug verion of this screen as a string.
	 * @return a string verion of the screen.
	 */
	public toString():string
	{
		try
		{
			return "[" + (<any>(this.constructor)).name + "]";
		}
		catch (e)
		{
			return "[GameScreen]";
		}
	}
	//#endregion
}
