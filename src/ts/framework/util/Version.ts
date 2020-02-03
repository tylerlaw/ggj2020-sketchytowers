/** @file Version.ts */

/**
 * Utility interface for read only versions.
 * format [major].[minor].[build].[revision].
 */
interface ReadonlyVersion
{
	//#region Members
	/** The major version number. */
	readonly major:number;

	/** The minor version number. */
	readonly minor:number;

	/** The build number. */
	readonly build:number;

	/** The revision number. */
	readonly revision:number;

	/** The string representation of the version number. */
	readonly str:string;

	/** An optional build name. */
	readonly name:string;
	//#endregion


	//#region String
	/**
	 * Returns a human readable format of the version string and name.
	 * @returns A human readable format of the version string and name.
	 */
	toString():string;
	//#endregion
}

/**
 * Utility class for parsing version numbers encoded in standard
 * format [major].[minor].[build].[revision].
 */
class Version implements ReadonlyVersion
{
	//#region Members
	/** @inheritdoc */
	public major:number = 0;

	/** @inheritdoc */
	public minor:number = 0;

	/** @inheritdoc */
	public build:number = 0;

	/** @inheritdoc */
	public revision:number = 0;

	/** @inheritdoc */
	public str:string = "0.0.0.0";

	/** @inheritdoc */
	public name:string = "";
	//#endregion


	//#region Constructor
	/**
	 * Constructs a new version with the default 0 number.
	 */
	public constructor() {}
	//#endregion


	//#region Initializers
	/**
	 * Initializes a version to 0 with the specified name.
	 * @param name The name of the version.
	 */
	public fromName(name:string):void
	{
		this.str = "0.0.0.0";
		this.major = this.minor = this.build = this.revision = 0;
		this.name = name;
	}

	/**
	 * Initializes a version number from the specified string. Optionally
	 * sets a name for the version.
	 * @param str A version string of format [major].[minor].[build].[revision]
	 * @param name (optional) A name for the version.
	 */
	public fromVersionString(str:string, name?:string):Version
	{
		this.str = str;
		this.name = name || "";

		const parts:string[] = str.split(".");
		this.major = parts.length > 0 ? parseInt(parts[0], 10) : 0;
		this.minor = parts.length > 1 ? parseInt(parts[1], 10) : 0;
		this.build = parts.length > 2 ? parseInt(parts[2], 10) : 0;
		this.revision = parts.length > 3 ? parseInt(parts[3], 10) : 0;

		return this;
	}

	/**
	 * Initializes a version from the specified numbers with and optional name.
	 * @param major The major version number.
	 * @param minor (optional) The minor version number.
	 * @param build (optional) The build version number.
	 * @param revision (optional) The revision version number.
	 * @param name (optional) A name for the version.
	 */
	public fromVersionNumbers(major:number, minor?:number, build?:number, revision?:number, name?:string):Version
	{
		this.major = major || 0;
		this.minor = minor || 0;
		this.build = build || 0;
		this.revision = revision || 0;
		this.name = name || "";

		this.str = "";
		if (major !== undefined) this.str += major;
		if (minor !== undefined) this.str += "." + minor;
		if (build !== undefined) this.str += "." + build;
		if (revision !== undefined) this.str += "." + revision;

		return this;
	}
	//#endregion


	//#region Compare
	/**
	 * Comparator function that compares two version numbers. Returns -1 if a is lower, 
	 * returns 1 if be is lower, returns 0 if they are the same.
	 * @param a The first instance to check.
	 * @param b The second instance to check.
	 * @returns Returns -1 if a is lower, returns 1 if be is lower, returns 0 if they are the same.
	 */
	public static compare(a:ReadonlyVersion, b:ReadonlyVersion):number
	{
		if (a.major < b.major) return -1;
		if (a.major > b.major) return 1;

		if (a.minor < b.minor) return -1;
		if (a.minor > b.minor) return 1;

		if (a.build < b.build) return -1;
		if (a.build > b.build) return 1;

		if (a.revision < b.revision) return -1;
		if (a.revision > b.revision) return 1;

		return 0;
	}
	//#endregion


	//#region String
	/** @inheritdoc */
	public toString():string
	{
		let str:string = "";
		if (this.name !== "") str += this.name + " ";
		return str + this.str;
	}
	//#endregion
}
