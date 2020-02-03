/** @file Cell.ts */

/// <reference path="Edge.ts" />

const enum Mark
{
	Unknown = 0,
	Open = 1,
	Closed = 2
}

class Cell
{
	public readonly i:int;
	public readonly r:int;
	public readonly c:int;

	public neighbors:Edge[] = [];

	/** Indicates a permanently blocked cell, use this for non walkable areas drawn into the map. */
	public walkable:boolean = true;

	/** Indicates if building is allowed on this cell. We don't want to let the player build where monsters come in. */
	public buildable:boolean = true;

	public hasTree:boolean = false;

	public hasTower:boolean = false;


	public tree:TreeSprite = null;
	public tower:TowerSprite = null;


	public isRoad:boolean = false;

	public readonly x:number;
	public readonly y:number;

	public readonly center:Vector2;

	public g:number = 0;
	public h:number = 0;
	public f:number = 0;
	public pass:int = 0;
	public mark:Mark = Mark.Unknown;
	public parent:Cell = null;


	public constructor(r:int, c:int)
	{
		this.i = r * Map.GRID_WIDTH + c;
		this.r = r;
		this.c = c;
		this.x = (c + 0.5) * Map.CELL_WIDTH;
		this.y = (r + 0.5) * Map.CELL_HEIGHT;
		this.center = new Vector2(this.x, this.y);
	}

	public addNeighbor(to:Cell):void
	{
		let edge:Edge = new Edge(to, new Vector2(this.x - to.x, this.y - to.y).length());
		this.neighbors.push(edge);
	}
}
