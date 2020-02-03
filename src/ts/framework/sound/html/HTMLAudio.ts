/** @file HTMLAudio.ts */

/// <reference path="HTMLAudioRenderer.ts" />

/**
 * Sound engine type for working with HTML Audio.
 * Really only setup to work on IE and as a media channel playback enforcer for iOS.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const HTMLAudio = new (class extends SoundEngine
{
	//#region Members
	/** The audio tag used to check html audio context state and force playback to the media channel on ios. */
	private _tag:HTMLAudioElement;
	//#endregion


	//#region Constructor
	/** @inheritdoc */
	public constructor()
	{
		super();

		// Bind
		this.play_result = this.play_result.bind(this);

		// tslint:disable
		/**
		 * A utility function for decompressing the base64 silence string.
		 * @param c The number of times the string is repeated in the string segment.
		 * @param a The string to repeat.
		 */
		function z(c:number,a:string){for(var e=a;c>1;c--)e+=a;return e}
		// tslint:enable

		// We only need and html thread if web audio isn't supported or we're running on iOS
		// If web audio isn't supported, we need this to check the html audio suspension state so things can properly be paused when the page is minized (IE ONLY)
		// If iOS, then we need this to just run on loop in the background to keep web audio playing on the media channel
		if (!WebAudio.isSupported || System.os === OS.AppleiOS)
		{
			this.isSupported = true;

			// Create the tag
			if (System.os === OS.AppleiOS)
			{
				// NOTE: airplay MUST be disabled this way
				let tmp:HTMLDivElement = document.createElement("div");
				tmp.innerHTML = "<audio x-webkit-airplay='deny'></audio>";
				this._tag = <any>tmp.children.item(0);
			}
			else
			{
				// NOTE: Tag must be created this way on chrome otherwise you hit a weird bug where pause is automatically called on the tag when play is called, very odd
				this._tag = document.createElement("audio");
			}
			this._tag.controls = false;
			(<any>this._tag).disableRemotePlayback = true;				// Airplay like controls on other devices, prevents casting of the tag
			this._tag.preload = "auto";

			// Set the src to a short bit of url encoded as a silent mp3
			// NOTE The silence MP3 must be high quality, when web audio sounds are played in parallel the web audio sound is mixed to match the bitrate of the html sound
			// 0.01 seconds of silence VBR220-260 Joint Stereo 859B
			// Uncompressed: "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";
			// Below is the compressed version down to about 400B including the decompress function above
			//this._tag.src = "data:audio/mpeg;base64,//uQx" +z(23,"A")+"WGluZwAAAA8AAAACAAACcQCA"+z(16,"gICA")+z(66,"/")+"8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI"+z(320,"A")+"//sQxAADgnABGiAAQBCqgCRMAAgEAH"+z(15,"/")+"7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq"+z(18,"/")+"9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw"+z(97,"V")+"Q==";
			this._tag.src = "data:audio/mpeg;base64,//uQx" + z(23, "A") + "WGluZwAAAA8AAAACAAACcQCA" + z(16, "gICA") + z(66, "/") + "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" + z(320, "A") + "//sQxAADgnABGiAAQBCqgCRMAAgEAH" + z(15, "/") + "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" + z(18, "/") + "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" + z(97, "V") + "Q==";
			this._tag.loop = true;
			this._tag.load();

			// Try to play right off the bat
			this.checkState(true);
		}
		else
		{
			// Not needed on this device
			this.isSupported = false;
		}
	}
	//#endregion


	//#region App Component
	/** @inheritdoc  */
	public dispose():void
	{
		if (this._tag)
		{
			this._pending = true;											// Set to pending to prevent future state checks
			this.toggleUnlocking(false);
			this._tag.removeEventListener("playing", this.play_result);	// IE doesn't return a promise so fall back to events as well
			this._tag.removeEventListener("abort", this.play_result);
			this._tag.removeEventListener("error", this.play_result);
			this._tag.loop = false;
			this._tag.pause();
			this._tag.src = "";
			this._tag = null;
		}
	}
	//#endregion


	//#region Suspension
	/** @inheritdoc  */
	protected checkState(tryChange:boolean):void
	{
		// If we have a pending action, do nothing because a state change is likely coming
		if (this._pending) return;

		// Check real context state
		if (this._tag.paused)
		{
			// Tag isn't playing, check if our state matches
			if (this._run)
			{
				// We want to be running
				if (tryChange)
				{
					// Try forcing a change, so stop watching for unlocking events while attempt is in progress
					this.toggleUnlocking(false);

					// Start an attempt
					this._pending = true;
					let p:Promise<void>;
					try
					{
						p = this._tag.play();
						if (p) p.then(this.play_result, this.play_result);
						else
						{
							this._tag.addEventListener("playing", this.play_result);	// IE doesn't return a promise so fall back to events as well
							this._tag.addEventListener("abort", this.play_result);
							this._tag.addEventListener("error", this.play_result);
						}
					}
					catch (err)
					{
						this.play_result();		// Might happen on IE if there is an invalid state error
					}
				}
				else
				{
					// We're not going to try unlocking this time, but make sure unlocking events are enabled
					this.toggleUnlocking(true);
				}
			}
			else
			{
				// We don't want to be running, so no need to watch for unlocking events
				this.toggleUnlocking(false);

				// We want to be suspended, so this is good
				this.stateChange(true);
			}
		}
		else
		{
			// No need to watch for unlocking events while running
			this.toggleUnlocking(false);

			// Check if our state matches
			if (this._run)
			{
				// We want to be running, so this is good, unsuspend
				this.stateChange(false);
			}
			else
			{
				// We want to be suspended, we can suspend at any time
				this._tag.pause();			// instant action, so no need to set as pending
				this.stateChange(true);
			}
		}
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles a play request result.
	 */
	private play_result():void
	{
		// Make sure we're not disposed - its possible that this is a promise that resolved after disposal
		if (!this._tag) return;

		// Remove IE handlers
		this._tag.removeEventListener("playing", this.play_result);	// IE doesn't return a promise so fall back to events as well
		this._tag.removeEventListener("abort", this.play_result);
		this._tag.removeEventListener("error", this.play_result);

		// Tag started playing, so we're not suspended
		this._pending = false;
		this.checkState(false);
	}
	//#endregion
})();
