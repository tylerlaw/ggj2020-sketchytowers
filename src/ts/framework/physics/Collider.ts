/** @file Collider.ts */

/// <reference path="Geom.ts" />
/// <reference path="CircleGeom.ts" />
/// <reference path="SquareGeom.ts" />



class Collision
{
	public isCollision:boolean = false;
	public intersect:number = 0;
	public response:Vector2 = new Vector2();
}

class $Collider
{
	private readonly _vec:Vector2 = new Vector2();

	private readonly _collision:Collision = new Collision();

	public isCollision(a:Geom, b:Geom, v?:Vector2):Collision
	{
		this._collision.isCollision = false;
		this._collision.response.set(0, 0);
		this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
		if (this._collision.intersect > 0)
		{
			if (a.shape === GeomShape.Circle && b.shape === GeomShape.Circle)
			{
				this._collision.isCollision = true;
			}
			else if (a.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(a, <SquareGeom>b);
				this._collision.isCollision = this.isCollisionCircleSquare(a, <SquareGeom>b);
			}
			else if (b.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(b, <SquareGeom>a);
				this._collision.isCollision = this.isCollisionCircleSquare(b, <SquareGeom>a);
			}
			else
			{
				throw new Error("Not implemented");
			}
		}

		return this._collision;
	}

	private isCollisionCircleSquare(circle:CircleGeom, square:SquareGeom):boolean
	{
		let testX:number = circle.originX;
		let testY:number = circle.originY;

		if (circle.originX < square.x1) testX = square.x1;
		else if (circle.originX > square.x2) testX = square.x2;

		if (circle.originY < square.y1) testY = square.y1;
		else if (circle.originY > square.y2) testY = square.y2;

		this._collision.intersect = circle.radius - this._vec.set(circle.originX - testX, circle.originY - testY).length();

		//if (this._vec.set(circle.originX - testX, circle.originY - testY).length() < circle.radius)
		if (this._collision.intersect > 0)
		{
			return true;
		}
		{
			return false;
		}
	}
}

const Collider:$Collider = new $Collider();


/*
class Collision
{
	public isCollision:boolean = false;
	public intersect:number = 0;
	public response:Vector2 = new Vector2();
}

class $Collider
{
	private readonly _vec:Vector2 = new Vector2();

	private readonly _collision:Collision = new Collision();

	public isCollision(a:Geom, b:Geom, v?:Vector2):Collision
	{
		this._collision.isCollision = false;
		this._collision.response.set(0, 0);
		this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
		if (this._collision.intersect > 0)
		{
			if (a.shape === GeomShape.Circle && b.shape === GeomShape.Circle)
			{
				this._collision.isCollision = true;
			}
			else if (a.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(a, <SquareGeom>b);
				this._collision.isCollision = this.isCollisionCircleSquare(a, <SquareGeom>b);
			}
			else if (b.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(b, <SquareGeom>a);
				this._collision.isCollision = this.isCollisionCircleSquare(b, <SquareGeom>a);
			}
			else
			{
				throw new Error("Not implemented");
			}
		}

		return this._collision;
	}

	public getCollision(a:Geom, b:Geom):Collision
	{
		this._collision.isCollision = false;
		this._collision.intersect = a.radius + b.radius - this._vec.set(b.originX - a.originX, b.originY - a.originY).length();
		if (this._collision.intersect > 0)
		{
			if (a.shape === GeomShape.Circle && b.shape === GeomShape.Circle)
			{
				this._collision.isCollision = true;
			}
			else if (a.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(a, <SquareGeom>b);
				this._collision.isCollision = this.isCollisionCircleSquare(a, <SquareGeom>b);
			}
			else if (b.shape === GeomShape.Circle)
			{
				//return this.isCollisionCircleSquare(b, <SquareGeom>a);
				this._collision.isCollision = this.isCollisionCircleSquare(b, <SquareGeom>a);
			}
			else
			{
				throw new Error("Not implemented");
			}
		}

		return this._collision;
	}

	private isCollisionCircleSquare(circle:CircleGeom, square:SquareGeom):boolean
	{
		let testX:number = circle.originX;
		let testY:number = circle.originY;

		if (circle.originX < square.x1) testX = square.x1;
		else if (circle.originX > square.x2) testX = square.x2;

		if (circle.originY < square.y1) testY = square.y1;
		else if (circle.originY > square.y2) testY = square.y2;

		this._collision.intersect = circle.radius - this._vec.set(circle.originX - testX, circle.originY - testY).length();

		//if (this._vec.set(circle.originX - testX, circle.originY - testY).length() < circle.radius)
		if (this._collision.intersect > 0)
		{
			return true;
		}
		{
			return false;
		}
	}
}

const Collider:$Collider = new $Collider();
*/
