/** @file HTMLAudioRenderer.ts */

/// <reference path="HTMLAudio.ts" />
/// <reference path="../SoundRenderer.ts" />

/**
 * A sound renderer for playing back html audio.
 * Known Issues when web audio isn't available:
 * - Resuming isn't terribly accurate
 * - Resuming really doesn't work well on iOS and likely android as well, but web audio is supported there
 */
class HTMLAudioRenderer extends SoundRenderer<HTMLAudioElement>
{
	//#region Constructor
	/**
	 * @inheritdoc
	 * @internal
	 */
	public constructor(sound:Sound)
	{
		super(sound);

		// Bind
		this.tag_loadeddata = this.tag_loadeddata.bind(this);
		this.tag_play_rejected = this.tag_play_rejected.bind(this);
		this.tag_play_fulfilled = this.tag_play_fulfilled.bind(this);
	}
	//#endregion




	//#region Audio Engine Interface
	/** @inheritdoc */
	protected createSource():void
	{
		// Create the src
		let data:HTMLAudioElement = <HTMLAudioElement>this.sound.data.buffer;
		if (System.browser === Browser.Chrome)
		{
			// NOTE: chrome tag must be created this way otherwise you hit a weird bug where
			this._src = document.createElement("audio");
		}
		else
		{
			// NOTE: airplay MUST be disabled this way
			let tmp:HTMLDivElement = document.createElement("div");
			tmp.innerHTML = "<audio x-webkit-airplay='deny'></audio>";
			this._src = <any>tmp.children.item(0);
		}
		this._src.controls = false;
		(<any>this._src).disableRemotePlayback = true;				// Airplay like controls on other devices, prevents casting of the tag
		this._src.crossOrigin = data.crossOrigin;
		this._src.playbackRate = data.playbackRate;
		this._src.preload = "auto";

		// Watch for state changes
		this._src.addEventListener("ended", this.source_ended);
		this._src.addEventListener("loadeddata", this.tag_loadeddata);

		// Run base actions
		super.createSource();

		// Begin playback
		this._startTime = Date.now();
		this._src.src = data.src;
		let tag:HTMLAudioElement = this._src;
		let that:HTMLAudioRenderer = this;
		let promise:Promise<void> = this._src.play();
		if (promise) promise.then(this.tag_play_fulfilled).catch(function(reason:DOMException):void { that.tag_play_rejected(tag, reason); });
	}

	/** @inheritdoc */
	protected destroySource():void
	{
		// Stop watching for state changes
		this._src.removeEventListener("ended", this.source_ended);
		this._src.removeEventListener("loadeddata", this.tag_loadeddata);

		// Stop playback
		this._src.pause();

		// Run base actions
		super.destroySource();
	}

	/** @inheritdoc */
	public updateVolume():void
	{
		if (this._src)
		{
			this._src.volume = this._volume * this.sound.category.volume * SoundManager.volume;

			if (this._isMuted || this.sound.category.isMuted || SoundManager.isMuted) this._src.muted = true;
			else this._src.muted = false;
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles when the tag metadata has successfully loaded.
	 * Used to set the playback time.
	 */
	private tag_loadeddata():void
	{
		if (this._position !== 0) this._src.currentTime = this._position / 1000;
	}

	/**
	 * Handles when a tag starts playing back successfully.
	 */
	private tag_play_fulfilled():void
	{
		// Update the start time to get a more accurate resume position
		this._startTime = Date.now();
	}

	/**
	 * Handles when a tag fails to play.
	 * This might happen if a tag is started and stopped too frequently, but in that case can be ignored.
	 * This may also happen if autoplay is disabled and the sound can't be started, this can be seen in firefox.
	 * @param reason The error.
	 */
	private tag_play_rejected(tag:HTMLAudioElement, reason:DOMException):void
	{
		// Playback was disallowed for some reason, just pretend the sound complete
		// tslint:disable-next-line: no-console
		console.warn("Failed to playback HTMLAudio: " + reason);
		this.stop();
		this.onComplete.invoke(this);
	}
	//#endregion
}
