/** @file WebAudioRenderer.ts */

/// <reference path="WebAudio.ts" />
/// <reference path="../SoundRenderer.ts" />

/**
 * A sound renderer for playing back web audio.
 */
class WebAudioRenderer extends SoundRenderer<AudioBufferSourceNode>
{
	//#region Members
	/** The volume adjuster node. */
	private _gainNode:GainNode;
	//#endregion


	//#region Constructor
	/**
	 * @inheritdoc
	 * @internal
	 */
	public constructor(sound:Sound)
	{
		super(sound);
	}
	//#endregion


	//#region Audio Engine Interface
	/** @inheritdoc */
	protected createSource():void
	{
		// Create the nodes
		this._src = WebAudio.context.createBufferSource();
		this._src.buffer = <AudioBuffer>this.sound.data.buffer;
		this._gainNode = WebAudio.context.createGain();

		// Connect the audio graph
		this._src.connect(this._gainNode);
		this._gainNode.connect(WebAudio.context.destination);

		// Watch for state changes
		this._src.addEventListener("ended", this.source_ended);		// Not 100% sure that onended exists everywhere, so we do the event and the onended callback
		this._src.onended = this.source_ended;						// required by some android browsers

		// Run base actions
		super.createSource();

		// Begin playback
		this._startTime = Date.now();
		if (this._position > 0) this._src.start(0, this._position / 1000);	// Resuming
		else this._src.start();												// Playing from start - throws typeerror if a negative value is supplied as a time param
	}

	/** @inheritdoc */
	protected destroySource():void
	{
		// Stop watching for state changes
		this._src.removeEventListener("ended", this.source_ended);		// Not 100% sure that onended exists everywhere, so we do the event and the onended callback
		this._src.onended = null;

		// Stop playback
		this._src.stop();
		this._startTime = 0;

		// Disconnect the audio graph
		this._src.disconnect();
		this._gainNode.disconnect();

		// Free nodes
		this._gainNode = null;

		// Run base actions
		super.destroySource();
	}

	/** @inheritdoc */
	public updateVolume():void
	{
		if (this._gainNode)
		{
			if (this._isMuted || this.sound.category.isMuted || SoundManager.isMuted) this._gainNode.gain.value = 0;
			else this._gainNode.gain.value = this._volume * this.sound.category.volume * SoundManager.volume;
		}
	}
	//#endregion

}
