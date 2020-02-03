/** @file Sound.ts */

/** Delegate interface for handling sound events. */
interface SoundHandler { (sound:Sound):void; }

/**
 * The usable form of Sound data, like Bitmap to BitmapData. Used to playback sounds.
 */
class Sound
{
	//#region Events
	/** Invoke when a sound has completely finished playing a pass. Does NOT fire on loops. */
	public readonly onComplete:DelegateEvent<SoundHandler> = new DelegateEvent();
	//#endregion


	//#region Members
	/** The audio data to play back. @internal */
	public readonly data:SoundData;

	/** The renderer used to play back this sound. @internal */
	public readonly renderer:SoundRenderer<any>;

	/** The play back position in ms. */
	public get position():number { return this.renderer.position; }

	/** The duration in ms. */
	public get duration():number { return this.renderer.duration; }

	/** The volume [0-1]. */
	public get volume():number { return this.renderer.volume; }
	public set volume(v:number) { this.renderer.volume = v; }

	/** The mute setting. */
	public get isMuted():boolean { return this.renderer.isMuted; }
	public set isMuted(v:boolean) { this.renderer.isMuted = v; }
	
	/** Indicates if this sound is looping or not. */
	public get isLooped():boolean { return this.renderer.isLooped; }
	public set isLooped(v:boolean) { this.renderer.isLooped = v; }

	/** Indicates if this sound is playing. */
	public get isPlaying():boolean { return this.renderer.state === SoundState.Playing; }

	/** Indicates if this sound is stopped. */
	public get isStopped():boolean { return this.renderer.state === SoundState.Stopped; }

	/** Indicates if this sound is paused. */
	public get isPaused():boolean { return this.renderer.state === SoundState.Paused; }

	/** The sound category. */
	public get category():SoundCategory { return this._category; }
	public set category(v:SoundCategory)
	{
		v = v ? v : SoundManager.defaultCategory;
		if (v !== this._category) { this._category = v; this.renderer.updateVolume(); }
	}
	private _category:SoundCategory;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new sound.
	 * @param data The sound data to play back.
	 * @param category The category to play back with.
	 */
	public constructor(data:SoundData, category:string = "default")
	{
		this.data = data;
		this._category = SoundManager.getCategory(category);

		this.renderer = WebAudio.isSupported ? new WebAudioRenderer(this) : new HTMLAudioRenderer(this);
		this.renderer.onComplete.add(this.renderer_onComplete, this);
	}
	//#endregion


	//#region Playback
	/**
	 * Begins playing the sound. Should resume if paused or play from beginning if stopped.
	 */
	public play():void { this.renderer.play(); }

	/**
	 * Pauses the sound if playing. Leaves it stopped if stopped.
	 */
	public pause():void { this.renderer.pause(); }

	/**
	 * Resumes the sound if paused. Leaves it stopped if stopped.
	 */
	public resume():void { this.renderer.resume(); }

	/**
	 * Stops the sound if playing or paused.
	 */
	public stop():void { this.renderer.stop(); }
	//#endregion


	//#region Event Handlers
	/**
	 * Handles when the renderer has finished playback.
	 * @param renderer The renderer.
	 */
	private renderer_onComplete(renderer:SoundRenderer<any>):void
	{
		this.onComplete.invoke(this);
	}
	//#endregion
}
