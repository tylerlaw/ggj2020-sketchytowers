/** @file Edge.ts */

class Edge
{
	public readonly travelCost:number;
	public readonly to:Cell;

	public constructor(to:Cell, travelCost:number)
	{
		this.to = to;
		this.travelCost = travelCost;
	}
}
