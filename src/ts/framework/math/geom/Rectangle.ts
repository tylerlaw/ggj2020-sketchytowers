/** @file Rectangle.ts */

/// <reference path="PointHitArea.ts" />
/// <reference path="Circle.ts" />

/**
 * A readonly interface for the rectangle class
 */
interface ReadonlyRectangle extends PointHitArea
{
	//#region Members
	/** The x (left) position. */
	readonly x:number;

	/** The y (top) position. */
	readonly y:number;

	/** The width of the rectangle. */
	readonly width:number;

	/** The width of the rectangle. */
	readonly height:number;

	/** Indicates if the rectangle is empty (width or height are zero). */
	readonly isEmpty:boolean;

	/** Gets the bottom edge of the rectangle. y + height even if height is negative. */
	readonly bottom:number;

	/** Gets the right edge of the rectangle. x + width even if width is negative. */
	readonly right:number;
	//#endregion


	//#region Geom
	/**
	 * Returns true if the point vector is contained in the rectangle.
	 * @param v The vector to check.
	 * @returns true if the point vector is contained in the rectangle.
	 */
	containsVector(v:Vector2):boolean;
	//#endregion


	//#region Equatable
	/**
	 * Returns true if this rectangle's components are equal to the other rectangles.
	 * @param other The rectangle to check against.
	 */
	equals(other:ReadonlyRectangle):boolean;
	//#endregion


	//#region Cloneable
	/**
	 * Clones the rectangle.
	 * @returns a new rectangle with components set to match this rectangle.
	 */
	clone():ReadonlyRectangle;
	//#endregion


	//#region String
	/**
	 * Returns a human readable string of this object.
	 * @returns a human readable string of this object.
	 */
	toString():string;
	//#endregion
}

/**
 * A rectangle class.
 */
class Rectangle implements ReadonlyRectangle
{
	//#region Members
	/** @inheritdoc */
	public x:number;

	/** @inheritdoc */
	public y:number;

	/** @inheritdoc */
	public width:number;

	/** @inheritdoc */
	public height:number;

	/** @inheritdoc */
	public get isEmpty():boolean { return this.width === 0 || this.height === 0; }

	/** @inheritdoc */
	public get bottom():number { return this.y + this.height; }

	/** @inheritdoc */
	public get right():number { return this.x + this.width; }
	//#endregion


	//#region Constructor
	/**
	 * Creates a new rectangle.
	 * @param x The x position.
	 * @param y The y position.
	 * @param width The width of the rectangle.
	 * @param height The height of the rectangle.
	 */
	public constructor(x?:number, y?:number, width?:number, height?:number)
	{
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
	}
	//#endregion


	//#region Setting
	/**
	 * Sets the rectangles components.
	 * @param x The x position.
	 * @param y The y position.
	 * @param width The width of the rectangle.
	 * @param height The height of the rectangle.
	 * @returns This rectangle.
	 */
	public set(x:number, y:number, width:number, height:number):Rectangle
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		return this;
	}

	/**
	 * Copies the values of the supplied rectangle into this one.
	 * @param r The rectangle to copy.
	 * @return this rectangle.
	 */
	public copy(r:Rectangle):Rectangle
	{
		this.x = r.x;
		this.y = r.y;
		this.width = r.width;
		this.height = r.height;

		return this;
	}

	/**
	 * Floors the rectangle position and dimensions.
	 */
	public floor():Rectangle
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.floor(this.width);
		this.height = Math.floor(this.height);

		return this;
	}
	//#endregion


	//#region Geom
	/** @inheritdoc */
	public containsVector(v:Vector2):boolean
	{
		return (v.x >= this.x && v.x < this.x + this.width && v.y >= this.y && v.y < this.y + this.height);
	}

	/**
	 * Expands this rectangle to include the supplied rectangle.
	 * @param other The rectangle to encompass.
	 * @returns this rectangle.
	 */
	public extend(other:Rectangle):Rectangle
	{
		// TODO: FUTURE- this could be optimized
		const x:number = Math.min(this.x, other.x);
		const y:number = Math.min(this.y, other.y);
		const width:number = Math.max(this.x + this.width, other.x + other.width);
		const height:number = Math.max(this.y + this.height, other.y + other.height);

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		return this;
	}
	//#endregion

	
	//#region Equatable
	/** @inheritdoc */
	public equals(other:Rectangle):boolean
	{
		return other.x === this.x && other.y === this.y && other.width === this.width && other.height === this.height;
	}
	//#endregion


	//#region Cloneable
	/** @inheritdoc */
	public clone():Rectangle
	{
		return new Rectangle(this.x, this.y, this.width, this.height);
	}
	//#endregion


	//#region String
	/** @inheritdoc */
	public toString():string
	{
		return "[Rectangle (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + ")]";
	}
	//#endregion
}
