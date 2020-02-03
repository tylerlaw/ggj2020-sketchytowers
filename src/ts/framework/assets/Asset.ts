/** @file Asset.ts */

/// <reference path="../lang/delegate/DelegateEvent.ts" />

/** An asset event handler interface. */
interface AssetHandler<T> { (asset:Asset<T>):void; }

/**
 * Base class for an asset.
 * @template T the type of data.
 */
abstract class Asset<T>
{
	//#region Events
	/** Triggered when the asset has finished loading. @internal */
	public readonly onLoaded:DelegateEvent<AssetHandler<T>> = new DelegateEvent<AssetHandler<T>>();

	/** Triggered when loading an asset fails. @internal */
	public readonly onError:DelegateEvent<AssetHandler<T>> = new DelegateEvent<AssetHandler<T>>();

	public readonly onProgress:DelegateEvent<AssetHandler<T>> = new DelegateEvent<AssetHandler<T>>();
	//#endregion


	//#region Members
	/** The asset id, typically its path. */
	public readonly id:string;

	/** The asset's data. @readonly */
	public data:T = null;

	public progress:number = 0;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new asset.
	 * @param id The unique asset Id.
	 */
	protected constructor(id:string)
	{
		this.id = id;
	}
	//#endregion


	//#region Disposal
	/**
	 * Disposes of the asset.
	 * @internal
	 */
	public dispose():void
	{
		this.data = null;
	}
	//#endregion


	//#region Loading
	/**
	 * Loads the asset from a set of bytes.
	 * @param src The src.
	 * @internal
	 */
	public abstract load(src:string):void;

	/**
	 * Handles when the asset has loaded successfully.
	 */
	protected loaded():void
	{
		this.progress = 1;
		this.onLoaded.invoke(this);
	}

	/**
	 * Handles when the asset failed to load.
	 * @param msg An error message.
	 */
	protected error(msg:string):void
	{
		// tslint:disable-next-line: no-console
		console.warn("Failed to load", this.id, msg);

		this.onError.invoke(this);
	}
	//#endregion
}
