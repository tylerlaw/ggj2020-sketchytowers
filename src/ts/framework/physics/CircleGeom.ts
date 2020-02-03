/** @file CircleGeom.ts */

/// <reference path="Geom.ts" />

class CircleGeom extends Geom
{
	public constructor(radius:number)
	{
		super(GeomShape.Circle, radius);
	}


	public setOrigin(x:number, y:number):void
	{
		(<any>this).originX = x;
		(<any>this).originY = y;
	}
}
