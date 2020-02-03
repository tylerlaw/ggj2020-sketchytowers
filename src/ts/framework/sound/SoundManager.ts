/** @file SoundManager.ts */

/// <reference path="SoundState.ts" />
/// <reference path="SoundCategory.ts" />
/// <reference path="SoundData.ts" />
/// <reference path="SoundRenderer.ts" />
/// <reference path="Sound.ts" />
/// <reference path="SoundEngine.ts" />
/// <reference path="web/WebAudio.ts" />
/// <reference path="html/HTMLAudio.ts" />

/**
 * Manages game audio.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const SoundManager = new (class
{
	//#region Members
	/** The global volume [0-1]. */
	public get volume():number { return this._volume; }
	public set volume(v:number) { this.updateVolume(v); }
	private _volume:number = 1;

	/** The global mute setting. */
	public get isMuted():boolean { return this._isMuted; }
	public set isMuted(v:boolean) { this.updateMute(v); }
	private _isMuted:boolean = false;

	/** The default sound category. */
	public readonly defaultCategory:SoundCategory;

	/** All of the sound categories. */
	private readonly _categories:Dictionary<SoundCategory> = {};

	/** The set of all currently active sounds. */
	private readonly _activeSounds:Sound[] = [];
	//#endregion


	//#region Constructor
	/**
	 * Initializes the static instance.
	 */
	public constructor()
	{
		this.defaultCategory = new SoundCategory("default");
		this._categories[this.defaultCategory.name] = this.defaultCategory;
	}
	//#endregion


	//#region App Component
	/** @inheritdoc */
	public initialize():void
	{
		//HTMLAudio.initialize();
		//WebAudio.initialize();
	}

	/** @inheritdoc */
	public activate():void
	{
		// Activate HTML audio first to ensure media channel starts first
		HTMLAudio.activate();
		WebAudio.activate();
	}

	/** @inheritdoc */
	public deactivate():void
	{
		WebAudio.deactivate();
		HTMLAudio.deactivate();
	}
	//#endregion


	//#region Categories
	/**
	 * Creates a new sound category and returns it.
	 * May not use the reserved names default or AudioUnlocker.
	 * @param name The name of the category
	 * @throws Error if the name is in use or if the name is reserved.
	 */
	public createCategory(name:string):SoundCategory
	{
		if (this._categories[name]) throw "Sound Category (" + name + ") already exists!";

		let category:SoundCategory = new SoundCategory(name);
		this._categories[name] = category;
		return category;
	}

	/**
	 * Gets the sound category with the given name.
	 * @param name The name of the category.
	 * @throws Error if no category with that name exists.
	 */
	public getCategory(name:string):SoundCategory
	{
		let category:SoundCategory = this._categories[name];
		if (!category) throw new Error("Sound Category (" + name + ") does not exist!");
		return category;
	}
	//#endregion


	//#region Sounds
	/**
	 * Registers a sound as active.
	 * @param sound The sound.
	 */
	public registerActiveSound(sound:Sound):void
	{
		// tslint:disable-next-line: no-console
		if (this._activeSounds.indexOf(sound) >= 0) console.warn("Sound already registered");
		else this._activeSounds.push(sound);
	}

	/**
	 * Unregisters a sound as active.
	 * @param sound The sound.
	 */
	public unregisterActiveSound(sound:Sound):void
	{
		let idx:number = this._activeSounds.indexOf(sound);
		if (idx >= 0) this._activeSounds.splice(idx, 1);
		// tslint:disable-next-line: no-console
		else console.warn("Sound not registered");
	}
	//#endregion


	//#region Helpers
	/**
	 * Updates the global volume and propgates the change to all active sounds.
	 * @param v The new global volume.
	 */
	private updateVolume(v:number):void
	{
		v = Math.min(Math.max(0, v), 1);
		if (this._volume === v) return;
		this._volume = v;

		this.updateSoundVolumes();
	}

	/**
	 * Updates the global mute setting and propgates the change to all active sounds.
	 * @param v The new globl mute setting.
	 */
	private updateMute(v:boolean):void
	{
		if (this._isMuted === v) return;
		this._isMuted = v;

		this.updateSoundVolumes();
	}

	/**
	 * Propogates volume / mute settings to all sounds.
	 * Used by categories to handle when a category setting changes.
	 * @internal
	 */
	public updateSoundVolumes():void
	{
		for (let i:number = 0; i < this._activeSounds.length; ++i)
		{
			this._activeSounds[i].renderer.updateVolume();
		}
	}
	//#endregion
})();
