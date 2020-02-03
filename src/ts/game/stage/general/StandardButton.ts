/** @file StandardButton.ts */

class StandardButton extends Button
{
	public w:number;
	public h:number;
	public upFill:FillSettings;
	public downFill:FillSettings;
	public stroke:StrokeSettings;
	public text:string;
	public textSettings:TextSettings;
	public textFill:FillSettings;
	public shadowFill:FillSettings = new FillSettings("#000000");
	public shadowAlpha:number = 0.3;
	private readonly _mtx:Matrix2D = new Matrix2D();


	public constructor(
		w:number, h:number, txt:string,
		upFill:FillSettings = new FillSettings("#009999"),
		downFill:FillSettings = new FillSettings("#008E8E"),
		stroke:StrokeSettings = new StrokeSettings("#00A3A3", 24, true),
		textSettings:TextSettings = new TextSettings(Assets.fonts.OpenSans_Bold, 60, TextAlign.Center, TextBaseline.Middle), textFill:FillSettings = new FillSettings("#FFFFFF")
	)
	{
		super();

		this.w = w;
		this.h = h;
		this.upFill = upFill;
		this.downFill = downFill;
		this.stroke = stroke;
		this.text = txt;
		this.textSettings = textSettings;
		this.textFill = textFill;

		this.cursor = Cursor.Pointer;
		this.input.hitArea = new Rectangle(0, 0, this.w, this.h);
	}


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.isOver && this.isPressed)
		{
			ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 30), alpha * this.shadowAlpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.shadowFill, null, true);
			ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 10), alpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.upFill, this.stroke, true);
			ctx.drawText(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 10), alpha, this.w / 2, this.h / 2, this.text, this.textSettings, this.textFill, null, true);
		}
		else
		{
			ctx.drawRoundedRect(this._wvp.copy(matrix).append(1, 0, 0, 1, 0, 30), alpha * this.shadowAlpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.shadowFill, null, true);
			ctx.drawRoundedRect(matrix, alpha, 0, 0, this.w, this.h, 10, 10, 10, 10, this.upFill, this.stroke, true);
			ctx.drawText(matrix, alpha, this.w / 2, this.h / 2, this.text, this.textSettings, this.textFill, null, true);
		}

		super.render(ctx, matrix, alpha);
	}
}
