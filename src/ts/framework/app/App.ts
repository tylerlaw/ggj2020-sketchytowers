/** @file App.ts */

/// <reference path="../GameWindow.ts" />
/// <reference path="../input/keyboard/Keyboard.ts" />
/// <reference path="../input/mouse/Mouse.ts" />
/// <reference path="../input/touch/TouchScreen.ts" />
/// <reference path="../input/pointer/PointerInput.ts" />
/// <reference path="../sound/SoundManager.ts" />
/// <reference path="../assets/AssetManager.ts" />
/// <reference path="../stage/Stage.ts" />
/// <reference path="../Game.ts" />

/**
 * Helper interface for polyfilling the page visibility API.
 */
interface PageVisibilityAPI
{
	/** The hidden property name. @readonly */
	hidden:string;

	/** The vis change event name. @readonly */
	visibilitychange:string;
}

/**
 * Helper interface for polyfilling the Fullscreen API.
 * Support Table:
 * 	Windows: Chrome, Edge, IE, Firefox
 * 	Mac: Chrome, Safari, Firefox
 * 	iOS: None (force disabled on new ipads because its terrible)
 * 	Android: Chrome, Samsung Browser, Firefox
 */
interface FullscreenAPI
{
	/** The fullscreenEnabled property name. */
	readonly fullscreenEnabled:string;

	/** The fullscreenElement property name. */
	readonly fullscreenElement:string;

	/** The requestFullscreen function name. */
	readonly requestFullscreen:string;

	/** The exitFullscreen function name. */
	readonly exitFullscreen:string;

	/** The fullscreenchange event name. */
	readonly fullscreenchange:string;

	/** The fullscreenerror event name. */
	readonly fullscreenerror:string;
}

/**
 * Base app type. The app manages:
 * - overall app startup / shutdown
 * - active state
 * @staticclass
 */
// tslint:disable-next-line: typedef
const App = new (class
{
	//#region Events
	/** Triggered when the app becomes active. */
	public readonly onActivated:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	/** Triggered when the app becomes inactive. */
	public readonly onDeactivated:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	/** Triggered when teh app is disposed. */
	public readonly onDisposed:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	public readonly onFullscreenChange:DelegateEvent<Handler> = new DelegateEvent<Handler>();
	//#endregion


	//#region Members
	/** Indicates if the app is currently active or not. @readonly */
	public isActive:boolean = true;

	/** Indicates if the app is visible. @readonly @internal */
	public isVisible:boolean = true;

	/** Indicates if the app id disposed. @readonly */
	public isDisposed:boolean = false;

	/** iOS has a buggy page visibility API, luckily it dispatches blur and focus events on the window when vis change events should fire. */
	private _iosIsFocused:boolean = true;

	/** Describes the page visibility API. */
	private readonly _pageVisibilityAPI:PageVisibilityAPI;

	/** The fullscreen API. */
	private readonly _fullscreenAPI:FullscreenAPI;
	//#endregion


	//#region Constructor
	/**
	 * Initializes the static App instance.
	 * Must not be called in threads.
	 */
	public constructor()
	{
		// Bind
		this.doc_visChange = this.doc_visChange.bind(this);
		this.win_focuschange = this.win_focuschange.bind(this);

		// Determine PageVisibilityAPI
		if (document.hidden !== undefined) this._pageVisibilityAPI = { hidden:"hidden", visibilitychange:"visibilitychange" };
		else if ((<any>document).webkitHidden !== undefined) this._pageVisibilityAPI = { hidden:"webkitHidden", visibilitychange:"webkitvisibilitychange" };
		else if ((<any>document).mozHidden !== undefined) this._pageVisibilityAPI = { hidden:"mozHidden", visibilitychange:"mozvisibilitychange" };
		else if ((<any>document).msHidden !== undefined) this._pageVisibilityAPI = { hidden:"msHidden", visibilitychange:"msvisibilitychange" };
		// tslint:disable-next-line: no-console
		else console.warn("Page Visibility API is unsupported.");

		// Determine FullscreenAPI
		if (document.fullscreenEnabled !== undefined)
		{
			// Windows Chrome
			// Windows Firefox
			// Mac Chrome
			// Mac Firefox
			this._fullscreenAPI = {
				fullscreenEnabled: "fullscreenEnabled",
				fullscreenElement: "fullscreenElement",
				requestFullscreen: "requestFullscreen",
				exitFullscreen: "exitFullscreen",
				fullscreenchange: "fullscreenchange",
				fullscreenerror: "fullscreenerror"
			};
		}
		else if ((<any>document).webkitFullscreenEnabled !== undefined)
		{
			// Windows Chrome
			// Windows Edge
			// Mac Safari
			// Mac Chrome
			// iOS Safari
			this._fullscreenAPI = {
				fullscreenEnabled: "webkitFullscreenEnabled",
				fullscreenElement: "webkitFullscreenElement",
				requestFullscreen: "webkitRequestFullscreen",
				exitFullscreen: "webkitExitFullscreen",
				fullscreenchange: "webkitfullscreenchange",
				fullscreenerror: "webkitfullscreenerror"
			};
		}
		else if ((<any>document).mozFullScreenEnabled !== undefined)
		{
			// Windows Firefox
			// Mac Firefox
			this._fullscreenAPI = {
				fullscreenEnabled: "mozFullScreenEnabled",
				fullscreenElement: "mozFullScreenElement",
				requestFullscreen: "mozRequestFullScreen",
				exitFullscreen: "mozCancelFullScreen",
				fullscreenchange: "mozfullscreenchange",
				fullscreenerror: "mozfullscreenerror"
			};
		}
		else if ((<any>document).msFullscreenEnabled !== undefined)
		{
			// Internet Explorer
			this._fullscreenAPI = {
				fullscreenEnabled: "msFullscreenEnabled",
				fullscreenElement: "msFullscreenElement",
				requestFullscreen: "msRequestFullscreen",
				exitFullscreen: "msExitFullscreen",
				fullscreenchange: "MSFullscreenChange",
				fullscreenerror: "MSFullscreenError"
			};
		}

		// Disallow on iOS because it is a poor experience
		//if (System.os === OS.AppleiOS) this._fullscreenAPI = null;

		// Watch for events
		if (this._fullscreenAPI)
		{
			// Bind
			this.doc_fschange = this.doc_fschange.bind(this);

			// Start watching for events
			document.addEventListener(this._fullscreenAPI.fullscreenchange, this.doc_fschange);
		}
	}
	//#endregion


	//#region Initialization
	public initialize():void
	{
		// Init Components
		GameWindow.initialize();
		SoundManager.initialize();
		Keyboard.initialize();
		Mouse.initialize();
		TouchScreen.initialize();
		PointerInput.initialize();
		Stage.initialize();

		// Watch for visibility state changes, only available in main thread
		if (this._pageVisibilityAPI) document.addEventListener(this._pageVisibilityAPI.visibilitychange, this.doc_visChange, true);
		if (System.os === OS.AppleiOS)
		{
			// Watch for blur / focus events on ios because it doesn't dispatch vis change events properly
			window.addEventListener("focus", this.win_focuschange, true);
			window.addEventListener("blur", this.win_focuschange, true);
		}

		// Check initial state
		this.doc_visChange();
		if (System.os === OS.AppleiOS) this.win_focuschange();
	}
	//#endregion


	//#region State
	/**
	 * Called when the app becomes active.
	 */
	protected activate():void
	{
		if (this.isDisposed || this.isActive) return;
		this.isActive = true;

		// Refocus
		GameWindow.element.focus();

		// Activate components
		SoundManager.activate();

		this.onActivated.invoke();
	}

	/**
	 * Called when the app becomes inactive.
	 */
	protected deactivate():void
	{
		if (this.isDisposed || !this.isActive) return;
		this.isActive = false;

		this.onDeactivated.invoke();

		// Deactivate components
		TouchScreen.deactivate();
		Mouse.deactivate();
		Keyboard.deactivate();
		SoundManager.deactivate();
	}
	//#endregion


	//#region Errors
	/**
	 * Should be called by game code when a fatal error occurs and the app cannot continue.
	 * @param errorMsg The associated error message.
	 */
	public fatal(errorMsg:string):void
	{
		// tslint:disable-next-line: no-console
		console.error("FATAL ERROR: " + errorMsg);
	}
	//#endregion


	//#region Activation Tests
	/**
	 * Updates the active state.
	 */
	protected updateState():void
	{
		if (!this.testActive()) this.deactivate();
		else this.activate();
	}

	/**
	 * Tests if the app can be active.
	 * @return true if the app can be active.
	 */
	protected testActive():boolean
	{
		return !this.isDisposed && this.isVisible && this._iosIsFocused;
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles fullscreen state changes
	 */
	private doc_fschange():void
	{
		this.onFullscreenChange.invoke();
	}

	/**
	 * Called when the app vis state changed.
	 * Only used on main thread.
	 */
	private doc_visChange():void
	{
		let d:any = document;
		if (this._pageVisibilityAPI)
		{
			if (d[this._pageVisibilityAPI.hidden] === this.isVisible)
			{
				this.isVisible = !d[this._pageVisibilityAPI.hidden];
				this.updateState();
			}
		}
	}

	/**
	 * Handles window focus events, only used on ios.
	 * Only used on main thread.
	 * @param evt The focus event. If not specified, the process will run.
	 */
	private win_focuschange(evt?:FocusEvent):void
	{
		if (evt && evt.target !== window) return;

		if (document.hasFocus())
		{
			if (this._iosIsFocused) return;
			this._iosIsFocused = true;

			this.updateState();
		}
		else
		{
			if (!this._iosIsFocused) return;
			this._iosIsFocused = false;

			this.updateState();
		}
	}
	//#endregion
})();
