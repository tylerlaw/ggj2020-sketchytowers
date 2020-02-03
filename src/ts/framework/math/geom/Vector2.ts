/** @file Vector2.ts */

/**
 * Defines a vector with 2 components.
 */
class Vector2
{
	//#region Members
	/** The x component. */
	public x:number;

	/** The y component. */
	public y:number;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Vector2.
	 * @param x The x component. Default 0.
	 * @param y The y component. Default 0.
	 */
	public constructor(x?:number, y?:number)	// Optional is faster than default
	{
		this.x = x || 0;
		this.y = y || 0;
	}
	//#endregion


	//#region Setting
	/**
	 * Sets the vector values.
	 * @param x The x component.
	 * @param y The y component.
	 * @returns this object.
	 */
	public set(x:number, y:number):Vector2
	{
		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Copies the supplied vectors values to this values.
	 * @param v The vector to read values from.
	 * @returns this object.
	 * @throws Error if other is null or undefined.
	 */
	public copy(v:Vector2):Vector2
	{
		this.x = v.x;
		this.y = v.y;
		
		return this;
	}

	/**
	 * Floors the vector components.
	 * @returns this object.
	 */
	public floor():Vector2
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);

		return this;
	}

	/**
	 * Floors the vector components to a certain number of decimal places.
	 * @param decimalPlaces The number of decimal places to contain.
	 * @returns this object.
	 */
	public floorTo(decimalPlaces:number):Vector2
	{
		decimalPlaces = Math.pow(10, decimalPlaces);

		this.x = Math.floor(this.x * decimalPlaces) / decimalPlaces;
		this.y = Math.floor(this.y * decimalPlaces) / decimalPlaces;

		return this;
	}

	/**
	 * Rounds the vector components.
	 * @returns this object.
	 */
	public round():Vector2
	{
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		return this;
	}

	/**
	 * Rounds the vector components to a certain number of decimal places.
	 * @param decimalPlaces The number of decimal places to contain.
	 * @returns this object.
	 */
	public roundTo(decimalPlaces:number):Vector2
	{
		decimalPlaces = Math.pow(10, decimalPlaces);

		this.x = Math.round(this.x * decimalPlaces) / decimalPlaces;
		this.y = Math.round(this.y * decimalPlaces) / decimalPlaces;

		return this;
	}
	//#endregion


	//#region Cloning
	/**
	 * Creates a new instance of a vector with the same values as this one.
	 * @returns a new vector with the same values as this one.
	 */
	public clone():Vector2
	{
		return new Vector2(this.x, this.y);	// Because optional unspecified is faster
	}
	//#endregion


	public normalize():void
	{
		if (this.x !== 0 || this.y !== 0)
		{
			let l:number = this.length();
			if (l > 0)
			{
				this.x /= l;
				this.y /= l;
			}
			else
			{
				this.x = this.y = 0;
			}
		}
	}


	//#region Math
	/**
	 * Returns the distance between the point of this vector and another.
	 * @param v The other vector.
	 * @returns the distance between the point of this vector and the other.
	 * @throws Error if v is null or undefined.
	 */
	public distance(v:Vector2):number
	{
		return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
	}

	/**
	 * Returns the distance squared between the point of this vector and another.
	 * @param v The other vector.
	 * @returns the distance squared between the point of this vector and the other.
	 * @throws Error if v is null or undefined.
	 */
	public distanceSquared(v:Vector2):number
	{
		return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y);
	}

	/**
	 * Returns the length of this vector.
	 * @returns the length of this vector.
	 */
	public length():number
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	/**
	 * Returns the length squared of this vector.
	 * @returns the length squared of this vector.
	 */
	public lengthSquared():number
	{
		return this.x * this.x + this.y * this.y;
	}
	//#endregion


	//#region Interpolation
	/**
	 * Interpolates along the vector at the given scale s [0-1].
	 * @param s The scale along the vector [0-1].
	 * @param out The vector to set components of.
	 * @return out or a new vector.
	 */
	public interpolate(s:number, out?:Vector2):Vector2
	{
		out = out || new Vector2();

		out.x = this.x * s;
		out.y = this.y * s;

		return out;
	}
	//#endregion


	//#region String
	/**
	 * Returns a human readable string of this object.
	 * @returns a human readable string of this object.
	 */
	public toString():string
	{
		return "[Vector2 (x=" + this.x + " y=" + this.y + ")]";
	}
	//#endregion
}


