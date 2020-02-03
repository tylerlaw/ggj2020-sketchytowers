/** @file Color.ts */

/**
 * Represents a color with rgba components ranging from 0 to 1 inclusively.
 */
class Color
{
	//#region Members
	/** The red color component [0-1]. */
	public get r():number { return this._r; }
	public set r(v:number) { this._r = (v >= 1 ? 1 : v <= 0 ? 0 : v); }
	private _r:number;

	/** The green color component [0-1]. */
	public get g():number { return this._g; }
	public set g(v:number) { this._g = (v >= 1 ? 1 : v <= 0 ? 0 : v); }
	private _g:number;

	/** The blue color component [0-1]. */
	public get b():number { return this._b; }
	public set b(v:number) { this._b = (v >= 1 ? 1 : v <= 0 ? 0 : v); }
	private _b:number;

	/** The alpha color component [0-1]. */
	public get a():number { return this._a; }
	public set a(v:number) { this._a = (v >= 1 ? 1 : v <= 0 ? 0 : v); }
	private _a:number;
	//#endregion


	//#region Constructor
	/**
	 * Constructs a new color. Default params create opaque white.
	 * @param r The red color component [0-1].
	 * @param g The green color component [0-1].
	 * @param b The blue color component [0-1].
	 * @param a The alpha color component [0-1].
	 */
	public constructor(r:number = 1, g:number = 1, b:number = 1, a:number = 1)
	{
		this._r = (r >= 1 ? 1 : r <= 0 ? 0 : r);
		this._g = (g >= 1 ? 1 : g <= 0 ? 0 : g);
		this._b = (b >= 1 ? 1 : b <= 0 ? 0 : b);
		this._a = (a >= 1 ? 1 : a <= 0 ? 0 : a);
	}
	//#endregion


	//#region Setting
	/**
	 * Copies the values of the other color to this color.
	 * @param other The color to copy.
	 * @throws Error if other is not a valid color.
	 */
	public copy(other:Color):Color
	{
		this._r = other._r;
		this._g = other._g;
		this._b = other._b;
		this._a = other._a;

		return this;
	}

	/**
	 * Sets the color components.
	 * @param r The red color component [0-1].
	 * @param g The green color component [0-1].
	 * @param b The blue color component [0-1].
	 * @param a The alpha color component [0-1].
	 */
	public set(r:number, g:number, b:number, a:number):Color
	{
		this._r = (r >= 1 ? 1 : r <= 0 ? 0 : r);
		this._g = (g >= 1 ? 1 : g <= 0 ? 0 : g);
		this._b = (b >= 1 ? 1 : b <= 0 ? 0 : b);
		this._a = (a >= 1 ? 1 : a <= 0 ? 0 : a);

		return this;
	}

	/**
	 * Sets this color 
	 * @param fromColor The color to tween from.
	 * @param toColor The color to tween to.
	 * @param pct The amount to interpolate.
	 * @return This color for chaining.
	 */
	public interpolateFromTo(fromColor:Color, toColor:Color, pct:number):Color
	{
		return this.set(
			pct * (toColor._r - fromColor._r) + fromColor._r,
			pct * (toColor._g - fromColor._g) + fromColor._g,
			pct * (toColor._b - fromColor._b) + fromColor._b,
			pct * (toColor._a - fromColor._a) + fromColor._a
		);
	}
	//#endregion


	//#region Equatable
	/**
	 * Returns true iff the other color supplied matches.
	 * @param other The color to compare to.
	 * @throws Error if other is not a valid color.
	 */
	public equals(other:Color):boolean
	{
		return (this._r === other._r && this._g === other._g && this._b === other._b && this._a === other._a);
	}
	//#endregion


	//#region Cloning
	/**
	 * Create a new color with the same color components.
	 * @returns A new color with the same color components.
	 */
	public clone():Color
	{
		return new Color(this._r, this._g, this._b, this._a);
	}
	//#endregion


	//#region Conversion
	/**
	 * Returns a 6 character hex css style RGB value created from the rgb components of this color. Example #FFFFFF.
	 * NOTE: Endianness may be an issue on some systems.
	 * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @returns A 6 character hex css style RGB value created from the rgb components of this color. Example #FFFFFF.
	 */
	public toStyleHexRGB():string
	{
		const r:number = Math.round(this._r * 255);
		const g:number = Math.round(this._g * 255);
		const b:number = Math.round(this._b * 255);

		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	/**
	 * Sets the folor components from a 3 or 6 character hex css style RGB value to the.
	 * NOTE: untested
	 * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @param rgbHex The color string to read from. Example #FFFFFF or #FFF.
	 * @return this Color.
	 */
	public fromStyleHexRGB(rgbHex:string):Color
	{
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex:RegExp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		rgbHex = rgbHex.replace(shorthandRegex, function(m:any, r:any, g:any, b:any):any {
			return r + r + g + g + b + b;
		});

		const result:RegExpExecArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbHex);

		if (!result) throw new Error("Not a valid 6 or 3 char hex rgb value! " + rgbHex);

		this.r = parseInt(result[1], 16) / 255;
		this.g = parseInt(result[2], 16) / 255;
		this.b = parseInt(result[3], 16) / 255;

		return this;
	}

	/**
	 * Returns a rgba() css style function string created from the rgba components of this color. Example rgba(255, 255, 255, 1).
	 * NOTE: Endianness may be an issue on some systems.
	 * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @returns A rgba() css style function string created from the rgba components of this color. Example rgba(255, 255, 255, 1).
	 */
	public toStyleFuncRGBA():string
	{
		return "rgba(" + Math.round(this._r * 255) + ", " + Math.round(this._g * 255) + ", " + Math.round(this._b * 255) + ", " + this._a + ")";
	}
	//#endregion
}
