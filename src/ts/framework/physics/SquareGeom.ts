/** @file SquareGeom.ts */

/// <reference path="Geom.ts" />

class SquareGeom extends Geom
{
	public readonly size:number;

	public x1:number;
	public y1:number;
	public x2:number;
	public y2:number;


	public constructor(size:number)
	{
		super(GeomShape.Square, new Vector2(size / 2, size / 2).length());
	}


	public setOrigin(x:number, y:number):void
	{
		(<any>this).originX = x;
		(<any>this).originY = y;

		this.x1 = x - this.size / 2;
		this.y1 = y - this.size / 2;
		this.x2 = x + this.size / 2;
		this.y2 = y + this.size / 2;
	}
}
