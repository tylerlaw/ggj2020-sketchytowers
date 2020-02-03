/** @file WebAudio.ts */

/// <reference path="WebAudioRenderer.ts" />

/**
 * Sound engine type for working with Web Audio.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const WebAudio = new (class extends SoundEngine
{
	//#region Members
	/** The offline audio context class. */
	public readonly contextClass:AudioContext = window.AudioContext || (<any>window).webkitAudioContext;

	/** The underlying audio context. */
	public context:AudioContext;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		super();

		// Bind
		this.context_statechange = this.context_statechange.bind(this);
		this.context_promiseHandler = this.context_promiseHandler.bind(this);

		// Support test
		if (!this.contextClass)
		{
			// tslint:disable-next-line: no-console
			console.warn("Web Audio is not supported");
			this.isSupported = false;
		}
		else
		{
			this.isSupported = true;

			// Create context
			this.context = new (<any>this.contextClass)();

			// Watch for state changes
			this.context.onstatechange = this.context_statechange;

			// Check initial state
			this.checkState(false);
		}
	}
	//#endregion


	//#region Suspension
	/** @inheritdoc  */
	protected checkState(tryChange:boolean):void
	{
		// If we have a pending action, do nothing because a state change is likely coming
		if (this._pending) return;

		// Check real context state, if not running, assume suspended (ie iOS has an 'interrupted' state)
		if (this.context.state !== "running")
		{
			// Interrupted or suspended, check if our state matches
			if (this._run)
			{
				this.toggleUnlocking(true);

				// We want to be running
				if (tryChange)
				{
					// Try forcing a change, so stop watching for unlocking events while attempt is in progress
					//this.toggleUnlocking(false);

					// Start attempt
					//this._pending = true;	// Can't stay pending
					this.context.resume().then(this.context_promiseHandler, this.context_promiseHandler);
				}
				else
				{
					// We're not going to try unlocking this time, but make sure unlocking events are enabled
					//this.toggleUnlocking(true);
				}
			}
			else
			{
				// We don't want to be running, so no need to watch for unlocking events
				this.toggleUnlocking(false);

				// We want to be suspended, so this is good
				this.stateChange(true);
			}
		}
		else
		{
			// No need to watch for unlocking events while running
			this.toggleUnlocking(false);

			// Check if our state matches
			if (this._run)
			{
				// We want to be running, so this is good, unsuspend
				this.stateChange(false);
			}
			else
			{
				// We want to be suspended, we can suspend at any time
				//this._pending = true;	// Can't stay pending
				this.context.suspend().then(this.context_promiseHandler, this.context_promiseHandler);
			}
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles state changes on the context.
	 */
	private context_statechange():void
	{
		// Ensure we're not disposed, this shouldn't be called after a dispose, but I've seen it happen once on chrome
		if (!this.context) return;

		this.checkState(true);
	}

	/**
	 * Handles promise results.
	 */
	private context_promiseHandler():void
	{
		// Ensure we're not disposed, a promise could have resolved after being disposed
		if (!this.context) return;

		//this._pending = false;	// we dont bother with pending
		this.checkState(false);
	}
	//#endregion
})();
