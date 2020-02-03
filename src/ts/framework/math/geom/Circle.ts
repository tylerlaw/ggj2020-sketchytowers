/** @file Circle.ts */

/// <reference path="PointHitArea.ts" />

/**
 * A circle class.
 */
class Circle implements PointHitArea
{
	/** The origin of the circle. */
	public readonly origin:Vector2;
	
	/** The radius of the circle. */
	public radius:number;


	//#region Constructor
	/**
	 * Creates a new circle.
	 * @param x The x origin.
	 * @param y The y origin.
	 * @param radius The radius.
	 */
	public constructor(x:number = 0, y:number = 0, radius:number = 50)
	{
		this.origin = new Vector2(x, y);
		this.radius = radius;
	}
	//#endregion


	/**
	 * Tests if the supplied vector is contained within this circle.
	 * Those filling on the edge of the circle are considered outside of it.
	 * @param pt The point to test.
	 * @return true iff the point is within the circle.
	 */
	public containsVector(pt:Vector2):boolean
	{
		return pt.distanceSquared(this.origin) < this.radius * this.radius ? true : false;
	}
}
