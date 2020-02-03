/** @file AssetManager.ts */

/// <reference path="AssetEntry.ts" />
/// <reference path="Asset.ts" />
/// <reference path="FontAsset.ts" />
/// <reference path="ImageAsset.ts" />
/// <reference path="SoundAsset.ts" />

/**
 * Helper interface for queuing assets to load.
 */
interface AssetQueueItem
{
	/** The asset to load. */
	readonly asset:Asset<any>;

	/** The asset src. */
	readonly src:string;
}

/**
 * Unpacks the bundle files and maintains references to the files via their packed paths.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const AssetManager = new (class
{
	//#region Events
	/** Triggered when the asset manager has unpacked successfully. @internal */
	public readonly onLoaded:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	/** Triggered when the asset manager has unpacked successfully. @internal */
	public readonly onError:DelegateEvent<Handler> = new DelegateEvent<Handler>();

	public readonly onProgress:DelegateEvent<Handler> = new DelegateEvent<Handler>();
	//#endregion


	//#region Members
	/** The set of all unpacked assets stored by path (excluding extension). */
	private readonly _assets:Asset<any>[] = [];

	/** The number of pending assets still unpacking. */
	private _pending:int = 0;

	private _total:int = 0;

	/** Indicates if an error occurred while loading. */
	private _error:boolean = false;

	public progress:number = 0;
	//#endregion


	//#region Loading
	public load():void
	{
		let toLoad:AssetQueueItem[] = [];

		for (let id in Assets.manifest.images)
		{
			let asset:ImageAsset = new ImageAsset(id);
			toLoad.push({ asset: asset, src: (<any>Assets.manifest.images)[id] });
			this._assets.push(asset);
		}

		for (let id in Assets.manifest.sounds)
		{
			let asset:SoundAsset = new SoundAsset(id);
			toLoad.push({ asset: asset, src: (<any>Assets.manifest.sounds)[id] });
			this._assets.push(asset);
		}

		for (let id in Assets.manifest.fonts)
		{
			let asset:FontAsset = new FontAsset(id);
			toLoad.push({ asset: asset, src: (<any>Assets.manifest.fonts)[id] });
			this._assets.push(asset);
		}

		// Load each asset
		//console.log("loading items", Date.now());
		this._total = this._pending = toLoad.length;
		if (this._pending > 0)
		{
			for (let i:int = 0; i < toLoad.length; ++i)
			{
				let asset:Asset<any> = toLoad[i].asset;
				let src:string = toLoad[i].src;
				//console.log("   loading", asset.id, Date.now());
				asset.onLoaded.add(this.asset_onLoaded, this);
				asset.onError.add(this.asset_onError, this);
				asset.load(src);
			}
		}
		else
		{
			this.onLoaded.invoke();
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles when an asset loads successfully.
	 * @param asset The loaded asset.
	 */
	private asset_onLoaded(asset:Asset<any>):void
	{
		asset.onLoaded.remove(this.asset_onLoaded, this);
		asset.onError.remove(this.asset_onError, this);

		//console.log("   finished", asset.id, Date.now());

		if (!this._error)
		{
			this.asset_onProgress();

			this._pending--;
			if (this._pending === 0)
			{
				//console.log("finished unpack", Date.now());
				this.progress = 1;
				this.onProgress.invoke();
				this.onLoaded.invoke();
			}
		}
	}

	/**
	 * Handles when an asset fails to load.
	 * @param asset The asset that failed to load.
	 */
	private asset_onError(asset:Asset<any>):void
	{
		asset.onLoaded.remove(this.asset_onLoaded, this);
		asset.onError.remove(this.asset_onError, this);

		// Report the error if haven't already
		if (!this._error)
		{
			this._error = true;
			// tslint:disable-next-line: no-console
			console.warn("Failed to load assets.");
		}
	}

	private asset_onProgress():void
	{
		if (!this._error)
		{
			this.progress = 0;
			for (let asset of this._assets)
			{
				this.progress += asset.progress / this._total;
			}
			this.onProgress.invoke();
		}
	}
	//#endregion
})();
