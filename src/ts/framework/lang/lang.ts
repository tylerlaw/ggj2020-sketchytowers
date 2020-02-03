/** @file lang.ts */

//#region Libs
// Google Analytics
/**
 * gtag GA interface
 */
// tslint:disable-next-line: completed-docs
declare function gtag(command:"event", action:string, params:{ event_category?:string, event_label?:string, value?:uint;  }):void;
//#endregion


//#region Definition Polyfills
/**
 * The DedicatedWorkerGlobalScope object (the Worker global scope) is accessible through the self keyword.
 * Some additional global functions, namespaces objects, and constructors, not typically associated with the
 * worker global scope, but available on it, are listed in the JavaScript Reference.
 * See also: Functions available to workers.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope
 */
interface DedicatedWorkerGlobalScope
{
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage
	 * The postMessage() method of the DedicatedWorkerGlobalScope interface sends a message to the main thread that spawned it.
	 * This accepts a single parameter, which is the data to send to the worker. The data may be any value or JavaScript object
	 * handled by the structured clone algorithm, which includes cyclical references.
	 * @param aMessage The object to deliver to the main thread; this will be in the data field in the event delivered to the
	 * Worker.onmessage handler. This may be any value or JavaScript object handled by the structured clone algorithm, which includes cyclical references.
	 * @param transferList An optional array of Transferable objects to transfer ownership of. If the ownership of an object
	 * is transferred, it becomes unusable (neutered) in the context it was sent from and it becomes available only to the main
	 * thread it was sent to.
	 */
	postMessage(aMessage:any, transferList?:Transferable[]):void;
}

/** A readonly date type. */
interface ReadonlyDate
{
	/** Returns a string representation of a date. The format of the string depends on the locale. */
	toString():string;
	/** Returns a date as a string value. */
	toDateString():string;
	/** Returns a time as a string value. */
	toTimeString():string;
	/** Returns a value as a string value appropriate to the host environment's current locale. */
	toLocaleString():string;
	/** Returns a date as a string value appropriate to the host environment's current locale. */
	toLocaleDateString():string;
	/** Returns a time as a string value appropriate to the host environment's current locale. */
	toLocaleTimeString():string;
	/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
	valueOf():number;
	/** Gets the time value in milliseconds. */
	getTime():number;
	/** Gets the year, using local time. */
	getFullYear():number;
	/** Gets the year using Universal Coordinated Time (UTC). */
	getUTCFullYear():number;
	/** Gets the month, using local time. */
	getMonth():number;
	/** Gets the month of a Date object using Universal Coordinated Time (UTC). */
	getUTCMonth():number;
	/** Gets the day-of-the-month, using local time. */
	getDate():number;
	/** Gets the day-of-the-month, using Universal Coordinated Time (UTC). */
	getUTCDate():number;
	/** Gets the day of the week, using local time. */
	getDay():number;
	/** Gets the day of the week using Universal Coordinated Time (UTC). */
	getUTCDay():number;
	/** Gets the hours in a date, using local time. */
	getHours():number;
	/** Gets the hours value in a Date object using Universal Coordinated Time (UTC). */
	getUTCHours():number;
	/** Gets the minutes of a Date object, using local time. */
	getMinutes():number;
	/** Gets the minutes of a Date object using Universal Coordinated Time (UTC). */
	getUTCMinutes():number;
	/** Gets the seconds of a Date object, using local time. */
	getSeconds():number;
	/** Gets the seconds of a Date object using Universal Coordinated Time (UTC). */
	getUTCSeconds():number;
	/** Gets the milliseconds of a Date, using local time. */
	getMilliseconds():number;
	/** Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). */
	getUTCMilliseconds():number;
	/** Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC). */
	getTimezoneOffset():number;
	/** Returns a date converted to a string using Universal Coordinated Time (UTC). */
	toUTCString():string;
	/** Returns a date as a string value in ISO format. */
	toISOString():string;
	/** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
	toJSON(key?:any):string;
}

/** Defines the font face descriptors argument. */
declare interface FontFaceDescriptors
{
	/** The font family. */
	family:string;

	/** The font style. */
	style:string;

	/** The font weight. */
	weight:string;

	/** The font stretch. */
	stretch?:string;

	/** The unicode ranges. */
	unicodeRange?:string;

	/** The font variant. */
	variant:string;

	/** The font feature settings. */
	featureSettings?:string;
}

/** Event types for FontFaceSet. */
interface FontFaceSetEventMap
{
	// tslint:disable: completed-docs
	"loading":Event;
	"loadingdone":Event;
	"loadingerror":Event;
	// tslint:enable: completed-docs
}

/**
 * The FontFaceSet interface of the CSS Font Loading API manages the loading of font-faces and querying of their download status.
 */
declare interface FontFaceSet
{
	/** Indicates the font-face's loading status. It will be one of 'loading' or 'loaded'. */
	//readonly status:string;

	/** Promise which resolves once font loading and layout operations have completed. */
	//readonly ready:Promise<void>;


	/** An EventListener called whenever an event of type loading is fired, indicating a font-face set has started loading. */
	//onloading:{ (evt:Event):void };
	
	/** An EventListener called whenever an event of type loadingdone is fired, indicating that a font face set has finished loading. */
	//onloadingdone:{ (evt:Event):void };
	
	/** An EventListener called whenever an event of type loadingerror is fired, indicating that an error occurred whilst loading a font-face set. */
	//onloadingerror:{ (evt:Event):void };

	/** Adds a font to the font set. */
	add(font:FontFace):FontFaceSet;

	/** A Boolean that indicates whether a font is loaded, but doesn't initiate a load when it isn't. */
	//check():boolean; not enough documentation

	/** Removes all fonts from the font set. */
	//clear():void; not enough documentation

	/** Removes a font from the font set. */
	delete(font:FontFace):boolean;

	/** Returns a Promise which resolves to a list of font-faces for a requested font. */
	//load():Promise  not enough documentation



	// tslint:disable: completed-docs
	//addEventListener<K extends keyof FontFaceSetEventMap>(type:K, listener:(this:FontFaceSet, ev:FontFaceSetEventMap[K]) => any, options?:boolean | AddEventListenerOptions):void;
	//addEventListener(type:string, listener:EventListenerOrEventListenerObject, options?:boolean | AddEventListenerOptions):void;
	//removeEventListener<K extends keyof FontFaceSetEventMap>(type:K, listener:(this:FontFaceSet, ev:FontFaceSetEventMap[K]) => any, options?:boolean | EventListenerOptions):void;
	//removeEventListener(type:string, listener:EventListenerOrEventListenerObject, options?:boolean | EventListenerOptions):void;
	// tslint:enable: completed-docs
}

// tslint:disable-next-line: completed-docs
interface Document
{
	/** The returned value is the FontFaceSet interface of the document. The FontFaceSet interface is useful for loading new fonts, checking the status of previously loaded fonts etc. */
	fonts:FontFaceSet;
}

/**
 * Typing polyfill for the FontFace API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FontFace
 */
declare class FontFace
{
	/** A CSSOMString that determines how a font face is displayed based on whether and when it is downloaded and ready to use. */
	public display:string;

	/** A CSSOMString that retrieves or sets the family of the font. It is equivalent to the font-family descriptor. */
	public family:string;

	/** A CSSOMString that retrieves or sets infrequently used font features that are not available from a font's variant properties. It is equivalent to the font-feature-settings descriptor. */
	public featureSettings:string;

	/** Returns a Promise that resolves with the current FontFace object when the font specified in the object's constructor is done loading or rejects with a SyntaxError. */
	public readonly loaded:Promise<FontFace>;

	/** Returns an enumerated value indicating the status of the font, one of  "unloaded", "loading", "loaded", or "error". */
	public readonly status:"unloaded" | "loading" | "loaded" | "error";

	/** A CSSOMString that retrieves or sets how the font stretches. It is equivalent to the font-stretch descriptor. */
	public stretch:string;

	/** A CSSOMString that retrieves or sets the style of the font. It is equivalent to the font-style descriptor. */
	public style:string;

	/** A CSSOMString that retrieves or sets the range of unicode codepoints encompassing the font. It is equivalent to the unicode-range descriptor. */
	public unicodeRange:string;

	/** A CSSOMString that retrieves or sets the variant of the font. It is equivalent to the font-variant descriptor. */
	public variant:string;

	/** A CSSOMString that contains the weight of the font. It is equivalent to the font-weight descriptor. */
	public weight:string;


	/**
	 * Constructs and returns a new FontFace object, built from an external resource described by an URL or from an ArrayBuffer.
	 * @param family Specifies a name that will be used as the font face value for font properties. Takes the same type of values as the font-family descriptor of @font-face.
	 * @param source The font source. This can be either: A URL, Binary font data in the form of an ArrayBuffer.
	 * @param descriptors Optional. A set of optional descriptors passed as an object. It can have the following keys: family: Family, style: Style, weight: Weight, stretch: Stretch, unicodeRange: Unicode range, variant: variant, featureSettings: Feature settings
	 */
	public constructor(family:string, source:string | ArrayBuffer, descriptors?:FontFaceDescriptors);


	/**
	 * Loads a font based on current object's constructor-passed requirements, including a location or source buffer,
	 * and returns a Promise that resolves with the current FontFace object.
	 * @return A Promise that resolves with a reference to the current FontFace object when the font loads or rejects with a NetworkError if the loading process fails.
	 */
	public load():Promise<FontFace>;
}
//#endregion


//#region Primitives
/**
 * An alias for union of boolean and boolean shorthands (1 / 0).
 */
//declare type bool = number | boolean;

/**
 * An alias for the number type which indicates a single signed byte.
 */
declare type byte = number;

/**
 * An alias for the number type which indicates a single unsigned byte.
 */
declare type ubyte = number;

/**
 * An alias for the number type which indicates a signed short is expected.
 */
declare type short = number;

/**
 * An alias for the number type which indicates an unsigned short is expected.
 */
declare type ushort = number;

/**
 * An alias for the number type which indicates an integer is expected.
 */
declare type int = number;

/**
 * An alias for the number type which indicates a non-negative integer is expected.
 */
declare type uint = number;

/**
 * An alias for the number type which indicates a float is expected.
 */
declare type float = number;

/**
 * An alias for the number type which indicates a double is expected.
 */
declare type double = number;

/**
 * An alias for the string type which indicates a single 8-bit character is expected.
 */
declare type char = string;

/**
 * An alias for the string type which indicates a single 16-bit character is expected.
 */
declare type wchar = string;

/**
 * An alias for the string type which indicates a 16-bit character string is expected.
 */
declare type wstring = string;

/**
 * An alias for the number type which indicates a bitmask is used.
 */
declare type bitmask = number;

/**
 * An alias for a webgl parameter type.
 */
declare type WebGLParameterType = number;
//#endregion


//#region Size Of
/**
 * The byte length of various primitive numerical data types.
 */
const enum ByteLength
{
	/** Size of boolean */
	boolean = 1,

	/** Size of byte */
	byte = 1,

	/** Size of ubyte */
	ubyte = 1,

	/** Size of short */
	short = 2,

	/** Size of ushort */
	ushort = 2,

	/** Size of int */
	int = 4,

	/** Size of uint */
	uint = 4,

	/** Size of float */
	float = 4,

	/** Size of double */
	double = 8,

	/** Size of an 8-bit char */
	char = 1,

	/** Size of a 16-bit unicode char */
	wchar = 2,

	/** Size of number */
	number = 8
}

/**
 * The various types that a number can be interpreted as.
 */
const enum NumberDataType
{
	/** 8-bit signed byte, Int8 */
	byte = 0,

	/** 8-bit unsigned byte, Uint8 */
	ubyte = 1,

	/** 16-bit signed short, Int16 */
	short = 2,

	/** 16-bit unsigned short, Uint16 */
	ushort = 3,

	/** 32-bit signed int, Int32 */
	int = 4,

	/** 32-bit unsigned int, Uint32 */
	uint = 5,

	/** 32-bit floating point decimal value, Float32 */
	float = 6,

	/** 64-bit floating point decimal value, Float64 */
	double = 7
}
//#endregion


//#region Types
/**
 * Interface for any type references (class, enum, interface).
 */
interface Type {}

/**
 * Interface for a class reference.
 */
interface Class extends NewableFunction, Type {}
//#endregion


//#region Dictionary
/**
 * A helper interface for storing values in a hash of string to object.
 */
interface Dictionary<T>
{
	//#region Index
	/** Gets the value stored at the key value. */
	[key:string]:T;
	//#endregion
}

/**
 * A helper interface for storing values in a read only hash of string to object.
 */
interface ReadonlyDictionary<T> extends Dictionary<T>
{
	//#region Index
	/** Gets the value stored at the key value. */
	readonly [key:string]:T;
	//#endregion
}
//#endregion
