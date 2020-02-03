/** @file SoundCategory.ts */

/**
 * A category that a sound can be part of.
 * Entire categories can have volume or mute modifiers.
 */
class SoundCategory
{
	//#region Members
	/** The name of the category. */
	public readonly name:string;

	/** The volume modifier of the category [0-1]. */
	public get volume():number { return this._volume; }
	public set volume(v:number) { this.updateVolume(v); }
	protected _volume:number = 1;

	/** The mute modifier of the category. */
	public get isMuted():boolean { return this._isMuted; }
	public set isMuted(v:boolean) { this.updateMute(v); }
	protected _isMuted:boolean = false;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new sound category.
	 * @param name The name of the category.
	 * @internal
	 */
	public constructor(name:string)
	{
		this.name = name;
	}
	//#endregion


	//#region Helpers
	/**
	 * Updates the volume of the category. Triggering updates on all sounds in the category.
	 * @param v The new volume.
	 */
	private updateVolume(v:number):void
	{
		v = Math.min(Math.max(0, v), 1);
		if (this._volume === v) return;
		this._volume = v;

		SoundManager.updateSoundVolumes();
	}

	/**
	 * Updates the mute setting of the category. Triggering updates on all sounds in the category.
	 * @param v The new mute setting.
	 */
	private updateMute(v:boolean):void
	{
		if (this._isMuted === v) return;
		this._isMuted = v;

		SoundManager.updateSoundVolumes();
	}
	//#endregion

}
