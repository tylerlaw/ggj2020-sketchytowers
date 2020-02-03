/** @file AStar.ts */

class $AStar
{
	private _pass:int = 0;

	private _map:Map;

	public initialize(map:Map):void
	{
		this._map = map;
	}

	/*
	private distSqr(a:Cell, b:Cell):number
	{
		return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
	}
	*/

	
	private dist(a:Cell, b:Cell):number
	{
		return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
	}
	

	public findPath(startPos:Vector2, endPos:Vector2):Vector2[]
	{
		this._pass++;
		let pass:number = this._pass;

		let start:Cell = this._map.getCellAt(startPos.x, startPos.y);
		let end:Cell = this._map.getCellAt(endPos.x, endPos.y);

		if (start === end) return [startPos, endPos];

		let cell:Cell = start;
		cell.g = 0;
		cell.h = this.dist(start, end);
		cell.f = cell.g + cell.h;
		cell.pass = this._pass;
		cell.mark = Mark.Open;
		cell.parent = null;
		
		let open:Cell[] = [cell];

		while (open.length > 0)
		{
			open.sort(this.sort);
			cell = open.pop();
			cell.mark = Mark.Closed;

			if (cell === end)
			{
				
				let pts:Vector2[] = [];
				while (cell)
				{
					pts.unshift(cell.center);
					cell = cell.parent;
				}
				if (startPos.distanceSquared(pts[1]) <= pts[0].distanceSquared(pts[1]))
				{
					pts.shift();
				}
				if (endPos.distanceSquared(pts[pts.length - 2]) <= endPos.distanceSquared(pts[pts.length - 1]))
				{
					pts.pop();
				}
				pts.unshift(startPos);
				pts.push(endPos);
				return pts;
			}
			else
			{
				for (let i:int = 0; i < cell.neighbors.length; ++i)
				{
					let edge:Edge = cell.neighbors[i];
					let to:Cell = edge.to;
					let travelCost:number = edge.travelCost;
					if (cell.isRoad && to.isRoad)
					{
						//travelCost *= 0.5;
						
						//travelCost = 1;
					}
					if (to.hasTree)
					{
						travelCost *= 10;
					}
					if (to !== end && to.hasTower)
					{
						travelCost *= 10;
					}
					let g:number = cell.g + travelCost;
					let h:number = this.dist(to, end);
					let f:number = g + h;

					//if (!to.hasTree)
					//{
						if (to.pass === pass && (to.mark === Mark.Open || to.mark === Mark.Closed))
						{
							if (f < to.f)
							{
								to.f = f;
								to.g = g;
								to.h = h;
								to.parent = cell;
							}
						}
						else
						{
							to.pass = pass;
							to.g = g;
							to.f = f;
							to.h = h;
							to.parent = cell;
							to.mark = Mark.Open;
							open.push(to);
						}
					//}
				}
			}
		}

		return null;
	}

	private sort(a:Cell, b:Cell):number
	{
		if (a.f > b.f) return -1;
		else if (a.f < b.f) return 1;
		else return 0;
	}
}

const AStar:$AStar = new $AStar();
