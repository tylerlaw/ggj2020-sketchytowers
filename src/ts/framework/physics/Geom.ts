/** @file Geom.ts */

/// <reference path="../math/geom/Vector2.ts" />

interface Point
{
	readonly x:number;
	readonly y:number;
}

const enum GeomShape
{
	Circle = 0,
	Square = 1
}

abstract class Geom
{
	public readonly originX:number;
	public readonly originY:number;

	public readonly radius:number;
	public readonly radiusSquared:number;

	public readonly shape:GeomShape;


	protected constructor(shape:GeomShape, radius:number)
	{
		this.shape = shape;
		this.radius = radius;
		this.radiusSquared = radius * radius;
	}


	public abstract setOrigin(x:number, y:number):void;
}
