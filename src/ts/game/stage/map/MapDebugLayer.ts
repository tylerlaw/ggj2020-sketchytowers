/** @file Map.ts */

class MapDebugLayer extends Sprite
{
	public renderGrid:boolean = true;
	public renderWalkable:boolean = true;
	public renderBuildable:boolean = true;
	public renderBounds:boolean = true;


	public map:Map;


	public constructor(map:Map)
	{
		super();

		this.map = map;
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.renderGrid)
		{
			let stroke:StrokeSettings = new StrokeSettings("#00FF00", 1);
			for (let r:int = 0; r <= Map.GRID_HEIGHT; ++r)
			{
				ctx.drawLine(matrix, alpha, 0, r * Map.CELL_HEIGHT, Stage.width, r * Map.CELL_HEIGHT, stroke);
			}
			for (let c:int = 0; c <= Map.GRID_WIDTH; ++c)
			{
				ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH, 0, c * Map.CELL_WIDTH, Stage.height, stroke);
			}
		}
		for (let cell of this.map.grid)
		{
			if (cell.hasTree)
			{
				ctx.drawRect(matrix, alpha * 0.3, cell.center.x - Map.CELL_WIDTH / 2, cell.center.y - Map.CELL_HEIGHT / 2, Map.CELL_WIDTH, Map.CELL_HEIGHT, new FillSettings("#FF0000"));
			}
		}
		if (this.renderWalkable || this.renderBuildable)
		{
			let notWalkableFill:FillSettings = new FillSettings("#FF00FF");
			let notBuildableStroke:StrokeSettings = new StrokeSettings("#00FFFF", 2);
			for (let r:int = 0; r < Map.GRID_HEIGHT; ++r)
			{
				for (let c:int = 0; c < Map.GRID_WIDTH; ++c)
				{
					let cell:Cell = this.map.grid[r * Map.GRID_WIDTH + c];
					if (!cell.walkable) ctx.drawRect(matrix, alpha * 0.3, c * Map.CELL_WIDTH + 2, r * Map.CELL_HEIGHT + 2, Map.CELL_WIDTH - 4, Map.CELL_HEIGHT - 4, notWalkableFill);
					if (!cell.buildable)
					{
						ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH + 4, r * Map.CELL_HEIGHT + 4, (c + 1) * Map.CELL_WIDTH - 4, (r + 1) * Map.CELL_HEIGHT - 4, notBuildableStroke);
						ctx.drawLine(matrix, alpha, c * Map.CELL_WIDTH + 4, (r + 1) * Map.CELL_HEIGHT - 4, (c + 1) * Map.CELL_WIDTH - 4, r * Map.CELL_HEIGHT + 4, notBuildableStroke);
					}
				}
			}
		}
		if (this.renderBounds)
		{
			for (let playerSprite of this.map.playerSprites)
			{
				let boundsStroke:StrokeSettings = new StrokeSettings("#FF0000", 2);
				ctx.drawCircle(matrix, alpha, playerSprite.geom.originX, playerSprite.geom.originY, playerSprite.geom.radius, 0, 360, null, boundsStroke);
			}
			/*
			for (let treeSprite of this.map.treeSprites)
			{
				let boundsStroke:StrokeSettings = new StrokeSettings("#FF0000", 2);
				ctx.drawCircle(matrix, alpha, treeSprite.geom.originX, treeSprite.geom.originY, treeSprite.geom.radius, 0, 360, null, boundsStroke);
			}
			*/
		}

		super.render(ctx, matrix, alpha);
	}
}
