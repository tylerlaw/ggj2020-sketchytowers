/** @file PlayerSelectArrow.ts */

class PlayerSelectArrow extends Button
{
	private readonly stroke:StrokeSettings = new StrokeSettings("#FFFFFF", 10);
	private readonly shadowStroke:StrokeSettings = new StrokeSettings("#000000", 10);

	private readonly points:Vector2[] = [
		new Vector2(-20, -80),
		new Vector2(0, 0),
		new Vector2(-20, 80)
	];


	public constructor()
	{
		super();

		this.input.hitArea = new Rectangle(-30, -80, 60, 160);
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.isOver && this.isPressed)
		{
			ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 20, 10)), alpha * 0.3, this.points, null, this.shadowStroke, false, true);
			ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 20, 0)), alpha, this.points, null, this.stroke, false, true);
		}
		else
		{
			ctx.drawPath(this._wvp.copy(matrix).appendMatrix(new Matrix2D(1, 0, 0, 1, 0, 10)), alpha * 0.3, this.points, null, this.shadowStroke, false);
			ctx.drawPath(matrix, alpha, this.points, null, this.stroke, false);
		}
		

		super.render(ctx, matrix, alpha);
	}
}
