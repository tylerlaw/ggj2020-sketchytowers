/** @file PlayerStatBar.ts */

class PlayerStatBar extends Sprite
{
	public count:int = 4;

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		for (let i:int = 0; i < this.count; ++i)
		{
			ctx.drawRect(matrix, alpha, i * 60, (72 - 40) / 2, 40, 40, new FillSettings("#FFFFFF"));
		}

		super.render(ctx, matrix, alpha);
	}
}
