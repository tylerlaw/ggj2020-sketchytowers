/** @file FontAsset.ts */

/// <reference path="../font/Font.ts" />

/**
 * Loader for bundled font assets.
 * Attempts to load the font using the FontFace API if available.
 * If that failes it will fallback to loading using a style and interval
 * measuring of an offscreen font element.
 * 
 * Font Face API status
 * 	FontFaceSet
 * 		add		48
 * 	Document
 * 		fonts	60
 * 	
 */
class FontAsset extends Asset<Font>
{
	//#region Static Members
	/** A single embed holder element to keep the dom relatively clean. */
	private static _embedHolder:HTMLDivElement = null;

	/** Indicates if the font face api is supported */
	private static readonly _isFontFaceAPISupported:boolean = (function():boolean
	{
		let supported:boolean = document.fonts && document.fonts.add && document.fonts.delete && FontFace && !!FontFace.prototype.load;
		// tslint:disable-next-line: no-console
		if (!supported) console.warn("Font Face API is unsupported. Using embed test loading.");
		return supported;
	})();
	//#endregion


	//#region Members
	/** A FontFace instance used to load fonts when the FontFace api is available. */
	private _fontFace:FontFace = null;

	/** The style element used to add the font to the page when using embed loading. */
	private _style:HTMLStyleElement = null;

	/** Helper element for style based loading, hides a string of text off screen to force the font to load using a style src. */
	private _embed:HTMLDivElement = null;

	/** The last embed test measured width. */
	private _lastWidth:number = -1;

	/** The last embed test measured height. */
	private _lastHeight:number = -1;

	/** The time that measurement testing started. */
	private _startTime:number = null;

	/** The interval timer used to test embed size changes. */
	private _intervalId:number = null;

	/** The amount of time an embed measurement is allowed to test for. */
	private readonly _timeoutDelay:number = 3000;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new font asset.
	 * @param id The unique id of the asset.
	 * @internal
	 */
	public constructor(id:string)
	{
		super(id);

		// Bind
		this.fontFace_onfulfilled = this.fontFace_onfulfilled.bind(this);
		this.fontFace_onrejected = this.fontFace_onrejected.bind(this);
		this.setInterval_handler = this.setInterval_handler.bind(this);
	}
	//#endregion


	//#region Disposal
	/** @inheritdoc @internal */
	public dispose():void
	{
		if (FontAsset._isFontFaceAPISupported)
		{
			if (this._fontFace)
			{
				document.fonts.delete(this._fontFace);	// NOTE: it is okay to delete this without it being added, it just returns false
				this._fontFace = null;
			}
		}
		else
		{
			if (this._intervalId !== null) clearInterval(this._intervalId);
			this._intervalId = null;

			this._embed = null;

			if (FontAsset._embedHolder) document.body.removeChild(FontAsset._embedHolder);
			FontAsset._embedHolder = null;

			if (this._style) document.head.removeChild(this._style);
			this._style = null;
		}

		super.dispose();
	}
	//#endregion


	//#region Loading
	/** @inheritdoc @internal */
	public load(src:string):void
	{
		this.data = (<any>Assets.fonts)[this.id];

		// First try the font face api
		if (FontAsset._isFontFaceAPISupported) this.loadUsingFontFace(src);
		else this.loadUsingEmbedTest(src);
	}

	/** @inheritdoc */
	protected loaded():void
	{
		super.loaded();
	}
	//#endregion


	//#region Font Face API Loading
	/**
	 * Attempts loading via the FontFace API.
	 */
	private loadUsingFontFace(src:string):void
	{
		let descriptors:FontFaceDescriptors = { family: this.data.family, weight: this.data.weight, style: this.data.style, variant: this.data.variant };
		//console.log("loading font face", src);
		this._fontFace = new FontFace(
			this.data.family,
			"url(" + src + ")",
			descriptors
		);
		this._fontFace.load().then(this.fontFace_onfulfilled, this.fontFace_onrejected).catch(this.fontFace_onrejected);
	}

	/**
	 * Handles when a font face is successfully loaded with font face api.
	 * @param fontFace The loaded font face.
	 */
	private fontFace_onfulfilled(fontFace:FontFace):void
	{
		// If we were canceled, fontFace will be null
		if (!this._fontFace) return;

		document.fonts.add(fontFace);	// NOTE: must be added to the document for it to start rendering

		this.loaded();
	}

	/**
	 * Handles when a font face fails to load.
	 * @param reason The reason for failure, could be a string, DOMException, or some kind of error.
	 */
	private fontFace_onrejected(reason:any):void
	{
		// If we were canceled, fontFace will be null
		if (!this._fontFace) return;

		this.error("Font Face promise failed: " + reason);
	}
	//#endregion


	//#region Embed Test Loading
	/**
	 * Loads a font using embed testing.
	 */
	private loadUsingEmbedTest(src:string):void
	{
		// Add style element to kick off loading
		const css:string =
			"@font-face {\n" +
			"	font-family: '" + this.data.family + "';\n" +
			"	src: url('" + src + "') format('truetype');\n" +
			"	font-weight: " + this.data.weight + ";\n" +
			"	font-style: " + this.data.style + ";\n" +
			"	font-variant: " + this.data.variant + ";\n" +
			"	font-display: block;\n" +
			"}";
		this._style = document.createElement("style");
		this._style.innerHTML = css;
		document.head.appendChild(this._style);

		// Add the embed element w/o the correct family
		if (FontAsset._embedHolder === null)
		{
			FontAsset._embedHolder = document.createElement("div");
			FontAsset._embedHolder.style.cssText = "display: inline-block; clear: both; white-space: nowrap; position: absolute; top: -10000px; left: -10000px;";
			if (document.body.children.length > 0) document.body.insertBefore(FontAsset._embedHolder, document.body.children[0]);
			else document.body.appendChild(FontAsset._embedHolder);
		}
		this._embed = document.createElement("div");
		this._embed.style.cssText = "font-family: Arial; font-weight: " + this.data.weight + "; font-style: " + this.data.style + "; font-variant: " + this.data.variant + ";";
		this._embed.innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcderfhijklmnopqrstuvwxyz0123456789`~!@#$%^&amp;*()_-+=|\]}[{'&quot;;:/?.&gt;,&lt;";
		FontAsset._embedHolder.appendChild(this._embed);

		// Take an initial measurement
		this.measure();

		// Update to the correct family
		this._embed.style.cssText = "font-family: '" + this.data.family + "', Arial; font-weight: " + this.data.weight + "; font-style: " + this.data.style + "; font-variant: " + this.data.variant + ";";

		// Measure again and start measuring on interval if needed
		if (!this.check()) this.startInterval();
	}

	/**
	 * Measures the current size of the embed element.
	 * @return true iff the size changed.
	 */
	private measure():boolean
	{
		const width:number = this._embed.clientWidth;
		const height:number = this._embed.clientHeight;
		
		const changed:boolean = (width !== this._lastWidth || height !== this._lastHeight) ? true : false;
		this._lastWidth = width;
		this._lastHeight = height;
		
		return changed;
	}

	/**
	 * Checks if the size of the element has changed.
	 * @return true iff the size changed.
	 */
	private check():boolean
	{
		if (this.measure())
		{
			this.embedComplete();
			return true;
		}
		else
		{
			return false;
		}
	}

	/**
	 * Starts the embed measurement interval.
	 */
	private startInterval():void
	{
		this._startTime = Date.now();
		this._intervalId = setInterval(this.setInterval_handler, 1000 / 60);
	}

	/**
	 * Stops the embed measurement interval.
	 */
	private stopInterval():void
	{
		if (this._intervalId !== null) clearInterval(this._intervalId);
		this._intervalId = null;
	}

	/**
	 * Processes a measurement interval tick
	 */
	private setInterval_handler():void
	{
		if (this._intervalId !== null)
		{
			if (this.check())
			{
				
			}
			else
			{
				if (Date.now() - this._startTime >= this._timeoutDelay) this.embedTimeout();
			}
		}
	}

	/**
	 * Handles when an embed test times out.
	 */
	private embedTimeout():void
	{
		// Stop Ticking
		this.stopInterval();

		// Dump a warning
		// tslint:disable-next-line: no-console
		console.warn("Font " + this.data.family + " (weight: " + this.data.weight + ", style: " + this.data.style + ", variant: " + this.data.variant + ") timed out.");

		// Fonts are not super essential and we can never be 100% certain embed test loading even works properly, so we allow loading to continue anyway
		this.loaded();
	}

	/**
	 * Handles when an embed test comletes sucessfully.
	 */
	private embedComplete():void
	{
		this.stopInterval();

		this.loaded();
	}
	//#endregion

}
