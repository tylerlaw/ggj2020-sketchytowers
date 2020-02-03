/** @file SoundEngine.ts */

/**
 * Base type for an audio engine.
 */
abstract class SoundEngine
{
	//#region Events
	/** Triggered when the audio engine is suspended or resumed. */
	public readonly onStateChange:DelegateEvent<Handler> = new DelegateEvent<Handler>();
	//#endregion


	//#region Static Members
	/** The set of audio unlocking events. @see https://developers.google.com/web/updates/2018/11/web-audio-autoplay */
	public static readonly unlockingEvents:string[] = ["click", "contextmenu", "auxclick", "dblclick", "mousedown", "mouseup", "touchend", "keydown", "keyup"];

	/** Indicates if our desired state is running. */
	protected _run:boolean = true;

	/** Indicates if we have a currently unresolved promise. */
	protected _pending:boolean = false;

	/** Indicates if we're watching for unlockable events or not. */
	protected _unlockingEventsEnabled:boolean = false;
	//#endregion


	//#region Members
	/** Indicates if this audio engine is supported on the current system. @readonly */
	public isSupported:boolean;

	/** Indicates if the audio engine is currently suspended or not. @readonly */
	public isSuspended:boolean = true;
	//#endregion


	//#region Constructor
	protected constructor()
	{
		this.win_useraction = this.win_useraction.bind(this);
	}
	//#endregion


	//#region App Component
	/** @inheritdoc */
	public activate():void
	{
		if (this.isSupported)
		{
			this._run = true;
			this.checkState(true);
		}
	}

	/** @inheritdoc */
	public deactivate():void
	{
		if (this.isSupported)
		{
			this._run = false;
			this.checkState(true);
		}
	}
	//#endregion


	//#region Suspension
	/**
	 * Checks the current context state. If it is not the desired state,
	 * an attempt is made to change to the desired state.
	 * @param tryChange Indicates if a state change should be attempted if we're not in the desired state.
	 */
	protected abstract checkState(tryChange:boolean):void;

	/**
	 * Called when the context has entered a known state.
	 * @param suspended The current suspended state.
	 */
	protected stateChange(suspended:boolean):void
	{
		if (this.isSuspended === suspended) return;
		this.isSuspended = suspended;
		this.onStateChange.invoke();
	}

	/**
	 * Turns on or off watching for unlocking events.
	 * @param enable Indicates if events should be watched for or not.
	 */
	protected toggleUnlocking(enable:boolean):void
	{
		if (this._unlockingEventsEnabled === enable) return;
		this._unlockingEventsEnabled = enable;
		for (let i:int = 0; i < SoundEngine.unlockingEvents.length; ++i)
		{
			if (enable) window.addEventListener(SoundEngine.unlockingEvents[i], this.win_useraction, <any>{ capture: true, passive: true });
			else window.removeEventListener(SoundEngine.unlockingEvents[i], this.win_useraction, <any>{ capture: true, passive: true });
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles audio triggering user interaction events.
	 */
	protected win_useraction():void
	{
		// try resuming
		this.checkState(true);
	}
	//#endregion
}
