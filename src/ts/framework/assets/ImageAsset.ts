/** @file ImageAsset.ts */

/**
 * Tag based image loader for bundled image assets.
 * Converts the packed binary data to base64 and then loads it into the tag as a data uri.
 * Note that tag loading does not support progress events.
 */
class ImageAsset extends Asset<HTMLImageElement>
{
	//#region Members
	/** Indicates if we're listening on the tag. */
	private _listening:boolean = false;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new image asset.
	 * @param id The unique id of the asset.
	 * @internal
	 */
	public constructor(id:string)
	{
		super(id);

		// Bind
		this.data_error = this.data_error.bind(this);
		this.data_load = this.data_load.bind(this);
	}
	//#endregion


	//#region Disposal
	/** @inheritdoc @internal */
	public dispose():void
	{
		this.unlisten();
		super.dispose();
	}
	//#endregion


	//#region Loading
	/** @inheritdoc @internal */
	public load(src:string):void
	{
		this.data = document.createElement("img");

		this.listen();

		this.data.src = src;
	}

	/**
	 * Starts listening on the tag.
	 */
	private listen():void
	{
		if (this._listening) return;
		this._listening = true;

		this.data.addEventListener("abort", this.data_error);
		this.data.addEventListener("error", this.data_error);
		this.data.addEventListener("load", this.data_load);
	}

	/**
	 * Stops listening on the tag.
	 */
	private unlisten():void
	{
		if (!this._listening) return;
		this._listening = false;

		this.data.removeEventListener("abort", this.data_error);
		this.data.removeEventListener("error", this.data_error);
		this.data.removeEventListener("load", this.data_load);
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles tag load events.
	 * @param evt The event.
	 */
	private data_load(evt:Event):void
	{
		this.unlisten();

		(<any>Assets.images)[this.id] = new Texture(this.data);
		this.data = null;

		this.loaded();
	}

	/**
	 * Handles tag error / abort events.
	 * @param evt The event.
	 */
	private data_error(evt:Event):void
	{
		this.unlisten();

		this.error(evt.type);
	}
	//#endregion
}
