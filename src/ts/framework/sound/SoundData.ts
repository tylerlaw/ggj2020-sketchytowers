/** @file SoundData.ts */

/**
 * Defines the data required to create a sound.
 */
class SoundData
{
	//#region Members
	/** The default volume of sounds created from this data [0-1]. */
	public get volume():number { return this._volume; }
	public set volume(v:number) { this._volume = Math.max(Math.min(v, 1), 0); }
	private _volume:number = 1;

	/** The default looped state of sounds created from this data. */
	public isLooped:boolean = false;

	/** The duration in ms. */
	public readonly duration:number;

	/** The audio playback buffer / tag. @internal */
	public readonly buffer:AudioBuffer | HTMLAudioElement;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new sound data instance.
	 * @param buffer The audio playback buffer / tag.
	 * @internal
	 */
	public constructor(buffer:AudioBuffer | HTMLAudioElement)
	{
		this.buffer = buffer;
		this.duration = this.buffer.duration * 1000;
	}
	//#endregion
}
