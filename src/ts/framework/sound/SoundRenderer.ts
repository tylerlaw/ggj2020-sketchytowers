/** @file SoundRenderer.ts */

/// <reference path="../lang/delegate/DelegateEvent.ts" />
/// <reference path="SoundState.ts" />
/// <reference path="Sound.ts" />

/**
 * The usable form of Sound data, like Bitmap to BitmapData. Used to playback sounds.
 */
abstract class SoundRenderer<T extends AudioBufferSourceNode | HTMLAudioElement>
{
	//#region Events
	/** Invoke when a sound has completely finished playing a pass. Does NOT play on loops. */
	public readonly onComplete:DelegateEvent<{ (renderer:SoundRenderer<T>):void; }> = new DelegateEvent();
	//#endregion


	//#region Members
	/** Gets the associated Sound. */
	public readonly sound:Sound;

	/** The audio source to playback on. Only exists while playing. */
	protected _src:T;

	/** The current playback position in ms. */
	public get position():number
	{
		let pos:number = this._position;
		if (this.state === SoundState.Playing) pos += (Date.now() - this._startTime);
		if (pos < 0) pos = 0;
		if (pos >= this.duration) pos = this.duration;
		return pos;
	}
	protected _position:number = 0;

	/** The duration of the sound in ms. */
	public readonly duration:number;

	/** The volume of the renderer sound [0-1]. */
	public get volume():number { return this._volume; }
	public set volume(v:number)
	{
		v = Math.max(Math.min(v, 1), 0);	// Cap to [0, 1]
		if (this._volume === v) return;
		this._volume = v;
		this.updateVolume();
	}
	protected _volume:number;

	/** Indicates if this sound renderer is currently muted. */
	public get isMuted():boolean { return this._isMuted; }
	public set isMuted(v:boolean)
	{
		v = !!v;	// ensure a boolean
		if (this._isMuted === v) return;
		this._isMuted = v;
		this.updateVolume();
	}
	protected _isMuted:boolean = false;

	/** Indicates if this sound renderer is looping. */
	public get isLooped():boolean { return this._isLooped; }
	public set isLooped(v:boolean)
	{
		v = !!v;
		if (this._isLooped === v) return;
		this._isLooped = v;
		if (this._src) this._src.loop = v;
	}
	protected _isLooped:boolean;

	/** The time the node started playing. Used for computing playback position. */
	protected _startTime:number = 0;

	/** The sounds renderers playback state. @readonly */
	public state:SoundState = SoundState.Stopped;

	/** The sound engine used for playback. */
	protected engine:SoundEngine;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new sound renderer.
	 * @param sound The sound to playback.
	 * @internal
	 */
	public constructor(sound:Sound)
	{
		this.sound = sound;
		this.duration = sound.data.duration;
		this._volume = sound.data.volume;
		this._isLooped = sound.data.isLooped;
		this.engine = WebAudio.isSupported ? <any>WebAudio : HTMLAudio;

		// Bind
		this.source_ended = this.source_ended.bind(this);
	}
	//#endregion


	//#region Playback
	/**
	 * Begins playing the sound. Should resume if paused or play from beginning if stopped.
	 */
	public play():void
	{
		if (this.sound.duration > 1000 * 3)
		{
			console.log("stopping sound");
		}
		if (this.state === SoundState.Paused) this.resume();
		else if (this.state === SoundState.Stopped)
		{
			// Update state
			this.state = SoundState.Playing;

			// Reset starting position
			this._position = 0;

			// Watch for engine state changes
			this.engine.onStateChange.add(this.engine_onStateChange, this);

			// Create src
			if (!this.engine.isSuspended) this.createSource();
		}
	}

	/**
	 * Pauses the sound if playing. Leaves it stopped if stopped.
	 */
	public pause():void
	{
		
		if (this.state === SoundState.Playing)
		{
			// Get current position
			this._position = this.position;

			// Destroy src
			if (this._src) this.destroySource();

			// Update state
			this.state = SoundState.Paused;
		}
	}

	/**
	 * Resumes the sound if paused. Leaves it stopped if stopped.
	 */
	public resume():void
	{
		if (this.state === SoundState.Paused)
		{
			// Update state
			this.state = SoundState.Playing;

			// Create src from current position
			if (!this.engine.isSuspended) this.createSource();
		}
	}

	/**
	 * Stops the sound if playing or paused.
	 */
	public stop():void
	{
		if (this.sound.duration > 1000 * 3)
		{
			console.log("stopping sound");
		}
		if (this.state !== SoundState.Stopped)
		{
			// Reset to starting position
			this._position = 0;

			// Destroy src if it exists (means actively playing)
			if (this._src) this.destroySource();

			// Stop watching for engine state changes
			this.engine.onStateChange.remove(this.engine_onStateChange, this);

			// Update state
			this.state = SoundState.Stopped;
		}
	}
	//#endregion


	//#region Audio Engine Interface
	/**
	 * Creates the audio playback channel objects and begins playback
	 * from the current position.
	 */
	protected createSource():void
	{
		// Set initial state
		this._src.loop = this._isLooped;
		this.updateVolume();

		// Register
		SoundManager.registerActiveSound(this.sound);
	}

	/**
	 * Stops playback and destroys the playback channel objects.
	 */
	protected destroySource():void
	{
		// Free src
		this._src = null;

		// Unregister
		SoundManager.unregisterActiveSound(this.sound);
	}

	/**
	 * Called internally to update the volume.
	 */
	public abstract updateVolume():void;
	//#endregion


	//#region Event Handlers
	/**
	 * Handles when the sound has ended
	 * @param evt The event.
	 */
	protected source_ended(evt:Event):void
	{
		if (!this._src) return;														// we don't have a source set
		if (evt && evt.currentTarget && evt.currentTarget !== this._src) return;	// event from prior source

		this.destroySource();

		this._position = 0;

		this.state = SoundState.Stopped;

		// Stop watching for engine state changes
		this.engine.onStateChange.remove(this.engine_onStateChange, this);

		this.onComplete.invoke(this);
	}

	/**
	 * Handles when the engine suspension state chnages.
	 */
	private engine_onStateChange():void
	{
		if (this.engine.isSuspended)
		{
			if (this.state === SoundState.Playing)
			{
				// Get current position
				this._position = this.position;

				// Destroy src
				if (this._src) this.destroySource();
			}
		}
		else
		{
			// engine resumed
			if (this.state === SoundState.Playing && !this._src) this.createSource();
		}
	}
	//#endregion
}
