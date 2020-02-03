/** @file Dimmer.ts */

class Dimmer extends Sprite
{
	public w:number;
	public h:number;
	public fill:FillSettings = new FillSettings("#000000");
	public fillAlpha:number = 0.3;


	public constructor(
		
	)
	{
		super();
	}


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		ctx.drawRect(matrix, alpha * this.fillAlpha, 0, 0, Stage.width, Stage.height, this.fill);

		super.render(ctx, matrix, alpha);
	}
}
