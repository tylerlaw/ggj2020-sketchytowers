/** @file SoundAsset.ts */

/// <reference path="../sound/SoundData.ts" />

/**
 * Loader for bundled audio assets.
 * Attempts to load using the WebAudio API if availble.
 * If Web Audio is unavailable it will fallback to HTMLAudio.
 */
class SoundAsset extends Asset<SoundData>
{
	//#region Members
	/** Tracks if audio decoding was resolved. This is necessary because the handler is called twice in some cases and we need to be able to cancel. */
	private _waitingOnDecode:boolean = false;

	/** Indicates if we're listening on the tag. */
	private _listeningTag:boolean = false;

	private _request:XMLHttpRequest;

	private _listeningRequest:boolean = false;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new sound asset.
	 * @param id The unique id of the asset.
	 * @internal
	 */
	public constructor(id?:string)
	{
		super(id);

		// Bind
		this.request_load = this.request_load.bind(this);
		this.request_progress = this.request_progress.bind(this);
		this.request_error = this.request_error.bind(this);
		this.request_timeout = this.request_timeout.bind(this);
		this.request_abort = this.request_abort.bind(this);
		this.decodeAudioData_error = this.decodeAudioData_error.bind(this);
		this.decodeAudioData_success = this.decodeAudioData_success.bind(this);
		this.tag_canplaythrough = this.tag_canplaythrough.bind(this);
		this.tag_progress = this.tag_progress.bind(this);
		this.tag_error = this.tag_error.bind(this);
	}
	//#endregion


	//#region Disposal
	/** @inheritdoc @internal */
	public dispose():void
	{
		if (WebAudio.isSupported)
		{
			this._waitingOnDecode = false;
		}
		else
		{
			this.unlistenTag();
		}

		super.dispose();
	}
	//#endregion


	//#region Loading
	/** @inheritdoc @internal */
	public load(src:string):void
	{
		if (WebAudio.isSupported) this.loadUsingWebAudio(src);
		else this.loadUsingHTMLAudio(src);
	}
	//#endregion


	//#region Web Audio
	/**
	 * Starts loading using Web Audio.
	 * @param bytes The audio data.
	 */
	private loadUsingWebAudio(src:string):void
	{
		this._request = new XMLHttpRequest();
		this._request.open("GET", src, true);
		this._request.responseType = "arraybuffer";
		this.listenRequest();
		this._request.send();
	}

	/**
	 * Starts listening on the web audio request.
	 */
	private listenRequest():void
	{
		if (this._listeningRequest) return;
		this._listeningRequest = true;

		this._request.addEventListener("progress", this.request_progress);
		this._request.addEventListener("load", this.request_load);
		this._request.addEventListener("abort", this.request_abort);
		this._request.addEventListener("error", this.request_error);
		this._request.addEventListener("timeout", this.request_timeout);
	}

	/**
	 * Stops listening on the web audio request.
	 */
	private unlistenRequest():void
	{
		if (!this._listeningRequest) return;
		this._listeningRequest = false;

		this._request.removeEventListener("progress", this.request_progress);
		this._request.removeEventListener("load", this.request_load);
		this._request.removeEventListener("abort", this.request_abort);
		this._request.removeEventListener("error", this.request_error);
		this._request.removeEventListener("timeout", this.request_timeout);
	}

	/**
	 * Handles when a web audio request has progressed.
	 * @param evt The progress event.
	 */
	private request_progress(evt:ProgressEvent):void
	{
		if (evt.lengthComputable)
		{
			this.progress = 0.5 * evt.loaded / evt.total;
			this.onProgress.invoke(this);
		}
	}

	/**
	 * Handles when a web audio request has loaded.
	 * @param evt The event.
	 */
	private request_load(evt:Event):void
	{
		if (this._request.status === 404)
		{
			this.request_error(<any>{ type: "File not found (404)." });		// happens when a file isnt on the server
			return;
		}

		let arrayBuffer:ArrayBuffer = this._request.response;

		this.unlistenRequest();
		this._request = null;

		// NOTE: Promises are not supported everywhere but need to be handled when available, this will cause the handlers to fire twice in some cases
		this._waitingOnDecode = true;
		let promise:Promise<AudioBuffer> = WebAudio.context.decodeAudioData(arrayBuffer, this.decodeAudioData_success, this.decodeAudioData_error);
		if (promise) promise.then(this.decodeAudioData_success, this.decodeAudioData_error).catch(this.decodeAudioData_error);
	}
	
	/**
	 * Handles when a request is aborted.
	 * @param evt The aborted event.
	 */
	private request_abort(evt:Event):void
	{
		this.unlistenRequest();

		//this.handleAbort();
		this.error("Aborted");
	}

	/**
	 * Handles when a request times out.
	 * @param evt The timeout event.
	 */
	private request_timeout(evt:Event):void
	{
		this.unlistenRequest();

		//this.handleTimeout();
		this.error("Timeout");
	}

	/**
	 * Handles when a request results in an error.
	 * @param evt The error event or a spoof object like it.
	 */
	private request_error(e:Event):void
	{
		this.unlistenRequest();

		//this.handleError(new Error(e.type + " Error loading web audio data " + this.src), false);
		this.error("Error");
	}

	/**
	 * Handles when audio data is finished decoding.
	 * @param audioBuffer The decoded audio buffer.
	 */
	private decodeAudioData_success(audioBuffer:AudioBuffer):void
	{
		// Only allow resolution on the first call
		if (!this._waitingOnDecode) return;
		this._waitingOnDecode = false;

		this.data = new SoundData(audioBuffer);
		(<any>Assets.sounds)[this.id] = this.data;
		this.data = null;


		this.loaded();
	}

	/**
	 * Handles when there is an error decoding audio data.
	 * @param error The error that occurred
	 */
	private decodeAudioData_error(error:DOMException):void
	{
		// Only allow resolution on the first call
		if (!this._waitingOnDecode) return;
		this._waitingOnDecode = false;

		// Since crawlers (google bot) won't decode audio, we don't want to error out and show the crawler an error, instead just stub a short silent sound
		// Create an empty one-second stereo buffer at the sample rate of the AudioContext
		let fallbackBuffer:AudioBuffer = WebAudio.context.createBuffer(2, WebAudio.context.sampleRate * 1, WebAudio.context.sampleRate);

		this.data = new SoundData(fallbackBuffer);
		(<any>Assets.sounds)[this.id] = this.data;
		this.data = null;

		this.loaded();

		// Warn
		// tslint:disable-next-line: no-console
		console.warn("Failed to decode audio data and will use fallback for: ", this.id);

		/* OLD error on decode
		let errorMsg:string = "Error decoding audio data.";
		if (error)
		{
			try
			{
				errorMsg += " " + error.name + " " + error.message;
			} catch (e) {}
		}

		this.error(errorMsg);
		*/
	}
	//#endregion


	//#region HTML Audio
	/**
	 * Starts loading using HTML Audio.
	 * @param bytes The audio data.
	 */
	private loadUsingHTMLAudio(src:string):void
	{
		let tag:HTMLAudioElement = document.createElement("audio");
		this.data = new SoundData(tag);

		this.listenTag();
		tag.src = src;
		tag.load();
	}

	/**
	 * Starts listening on the tag.
	 */
	private listenTag():void
	{
		if (this._listeningTag) return;
		this._listeningTag = true;

		let tag:HTMLAudioElement = <HTMLAudioElement>this.data.buffer;

		if (System.os === OS.Android) tag.addEventListener("loadstart", this.tag_canplaythrough);
		else tag.addEventListener("canplaythrough", this.tag_canplaythrough);

		tag.addEventListener("progress", this.tag_progress);
		tag.addEventListener("error", this.tag_error);
		tag.addEventListener("abort", this.tag_error);
	}

	/**
	 * Stops listening on the tag.
	 */
	private unlistenTag():void
	{
		if (!this._listeningTag) return;
		this._listeningTag = false;

		let tag:HTMLAudioElement = <HTMLAudioElement>this.data.buffer;

		if (System.os === OS.Android) tag.removeEventListener("loadstart", this.tag_canplaythrough);
		else tag.removeEventListener("canplaythrough", this.tag_canplaythrough);

		tag.removeEventListener("error", this.tag_error);
		tag.removeEventListener("abort", this.tag_error);
		tag.removeEventListener("progress", this.tag_progress);
	}

	private tag_progress(evt:ProgressEvent):void
	{
		if (evt.lengthComputable)
		{
			this.progress = (evt.loaded / evt.total);
			this.onProgress.invoke(this);
		}
	}

	/**
	 * Handles when a tag has reached a playable state.
	 * @param evt The event.
	 */
	private tag_canplaythrough(evt:Event):void
	{
		this.unlistenTag();

		(<any>Assets.sounds)[this.id] = this.data;
		this.data = null;

		this.loaded();
	}

	/**
	 * Handles tag error events.
	 * @param evt The event.
	 */
	private tag_error(evt:Event):void
	{
		this.unlistenTag();

		this.error(evt.type);
	}
	//#endregion
}
