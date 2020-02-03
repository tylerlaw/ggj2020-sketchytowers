/** @file System.ts */

/// <reference path="../util/Version.ts" />
/// <reference path="OS.ts" />
/// <reference path="DeviceType.ts" />
/// <reference path="Browser.ts" />
/// <reference path="Platform.ts" />

/**
 * Holds information about the current runtime environment.
 * @staticclass
 */
// tslint:disable-next-line: typedef
const System = new (class
{
	//#region Members
	/** The device type. */
	public readonly device:DeviceType;

	/** The device operating system. */
	public readonly os:OS;

	/** The operating system version. Will be 0 if the OS could not be determined. Will also be 0 on ChromeOS. */
	public readonly osVersion:ReadonlyVersion;

	/** The browser playing the app. Note that some unrecognized browsers may end up reporting as chrome or safari. */
	public readonly browser:Browser;

	/** The browser version. Will be 0 if browser could not be determined. */
	public readonly browserVersion:ReadonlyVersion;

	/** The app hosting platform. */
	public readonly platform:Platform;
	//#endregion


	//#region Constructor
	/**
	 * Initializes the static instance.
	 */
	public constructor()
	{
		// Get the user agent and attempt detection
		const ua:string = navigator.userAgent.toLowerCase();


		//#region Helpers
		/**
		 * Parses a version string following prefix from the user agent.
		 * @param prefix The string of characters prefixing the version string.
		 * @returns The parsed version.
		 */
		function getVer(prefix:string):Version
		{
			let verStr:string = ua.substr(ua.indexOf(prefix) + prefix.length);
			if (verStr.indexOf(" ") >= 0) verStr = verStr.substr(0, verStr.indexOf(" "));
			if (verStr.indexOf(";") >= 0) verStr = verStr.substr(0, verStr.indexOf(";"));
			if (verStr.indexOf(")") >= 0) verStr = verStr.substr(0, verStr.indexOf(")"));
			while (verStr.indexOf("w") >= 0) verStr = verStr.replace("w", "");
			while (verStr.indexOf("_") >= 0) verStr = verStr.replace("_", ".");
			return new Version().fromVersionString(verStr);
		}
		//#endregion

		// Detect Platform
		this.platform = Platform.Web;

		// Detect OS
		if (ua.indexOf("cros") >= 0)
		{
			// NOTE: No current way to detect os version!
			this.os = OS.ChromeOS;
		}
		else if (ua.indexOf("android") >= 0)
		{
			// Detect kindle vs android
			if (ua.indexOf("kindle") >= 0 || ua.indexOf("; kf") >= 0 || ua.indexOf("silk/") >= 0) this.os = OS.FireOS;	// kindles
			else this.os = OS.Android;

			this.osVersion = getVer("android ");
		}
		else if (
		ua.indexOf("iphone") >= 0 && ua.indexOf("like iphone") < 0 ||	// IE Mobile adds "like i---" to its user agent for some reason
		ua.indexOf("ipad") >= 0 && ua.indexOf("like ipad") < 0 ||
		ua.indexOf("ipod") >= 0 && ua.indexOf("like ipod") < 0)
		{
			this.os = OS.AppleiOS;
			if (ua.indexOf("iphone os ") >= 0) this.osVersion = getVer("iphone os ");
			else if (ua.indexOf("cpu os ") >= 0) this.osVersion = getVer("cpu os ");
		}
		else if (ua.indexOf("Windows phone os ") >= 0)
		{
			this.os = OS.WindowsPhone;
			this.osVersion = getVer("windows phone os ");
		}
		else if (ua.indexOf("windows") >= 0)
		{
			this.os = OS.Windows;
			if (ua.indexOf("windows nt ") >= 0) this.osVersion = getVer("windows nt ");
			else this.osVersion = new Version();	// Probably windows ME or lower
		}
		else if (ua.indexOf("mac os x ") >= 0)
		{
			this.os = OS.Mac;
			this.osVersion = getVer("mac os x ");
		}
		else
		{
			this.os = OS.Unknown;
			this.osVersion = new Version();
		}

		// Detect Device Type
		if (this.os === OS.AppleiOS)
		{
			if (ua.indexOf("ipad") >= 0) this.device = DeviceType.Tablet;
			else this.device = DeviceType.Handheld;
		}
		else if (this.os === OS.FireOS)
		{
			this.device = DeviceType.Tablet;
		}
		else if (this.os === OS.Android)
		{
			if (ua.indexOf("mobile") >= 0) this.device = DeviceType.Handheld;
			else this.device = DeviceType.Tablet;
		}
		else if (this.os === OS.Windows && ua.indexOf("windows phone os") >= 0)
		{
			this.device = DeviceType.Handheld;
		}
		else
		{
			// Default back to computer if unknown
			this.device = DeviceType.Computer;
		}

		// Detect Browser
		if (ua.indexOf("silk/") >= 0)
		{
			this.browser = Browser.Silk;
			this.browserVersion = getVer("silk/");
		}
		else if (ua.indexOf("[fban/") >= 0 || ua.indexOf("[fb_iab/") >= 0)
		{
			this.browser = Browser.Facebook;
			this.browserVersion = getVer("fbav/");
		}
		else if (ua.indexOf("edge") >= 0)
		{
			this.browser = Browser.Edge;
			this.browserVersion = getVer("edge/");
		}
		else if (ua.indexOf("edg") >= 0)
		{
			this.browser = Browser.EdgeChromium;
			this.browserVersion = getVer("edg/");
		}
		else if (ua.indexOf("firefox") >= 0)
		{
			this.browser = Browser.Firefox;
			this.browserVersion = getVer("firefox/");
		}
		else if (ua.indexOf("opr/") >= 0)
		{
			this.browser = Browser.Opera;
			this.browserVersion = getVer("opr/");
		}
		else if (ua.indexOf("opera") >= 0)
		{
			this.browser = Browser.Opera;
			this.browserVersion = getVer("opera/");
		}
		else if (ua.indexOf("vivaldi") >= 0)
		{
			this.browser = Browser.Vivaldi;
			this.browserVersion = getVer("vivaldi/");
		}
		else if (ua.indexOf("samsungbrowser") >= 0)
		{
			this.browser = Browser.Samsung;
			this.browserVersion = getVer("samsungbrowser/");
		}
		else if (ua.indexOf("chrome") >= 0)
		{
			this.browser = Browser.Chrome;
			this.browserVersion = getVer("chrome/");
		}
		else if (this.os === OS.AppleiOS && ua.indexOf("crios") >= 0)
		{
			this.browser = Browser.Chrome;
			this.browserVersion = getVer("crios/");
		}
		else if (this.os === OS.AppleiOS && ua.indexOf("fxios") >= 0)
		{
			this.browser = Browser.Firefox;
			this.browserVersion = getVer("fxios/");
		}
		else if (this.os === OS.AppleiOS && ua.indexOf("safari") >= 0 && ua.indexOf("version/") >= 0)
		{
			this.browser = Browser.Safari;
			this.browserVersion = getVer("version/");
		}
		else if (this.os === OS.Mac && ua.indexOf("safari") >= 0 && ua.indexOf("version/") >= 0)
		{
			this.browser = Browser.Safari;
			this.browserVersion = getVer("version/");
		}
		else if (ua.indexOf("msie") >= 0)
		{
			// Older 9 / 10
			this.browser = Browser.IE;
			this.browserVersion = getVer("msie ");
		}
		else if (ua.indexOf("trident/") >= 0)
		{
			// IE 11
			this.browser = Browser.IE;
			this.browserVersion = getVer("rv:");
		}
		else
		{
			this.browser = Browser.Unknown;
			this.browserVersion = new Version();
		}
	}
	//#endregion

})();
