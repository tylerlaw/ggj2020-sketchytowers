/** @file TextField.ts */

/// <reference path="Sprite.ts" />

/**
 * Display object class for rendering a string of text.
 */
class TextField extends Sprite
{
	//#region Members
	/** The string of text to be displayed. */
	public text:string;

	/** The font settings to render with. */
	public font:TextSettings;

	/** The fill settings to render with. */
	public fill:FillSettings;

	/** The stroke settings to render with. */
	public stroke:StrokeSettings;

	/** The target area to render in. This is the target bounds to fit the text into. */
	public textArea:Rectangle = new Rectangle(0, 0, 0, 0);
	//#endregion


	//#region Constructor
	/**
	 * Creates a new text field to render.
	 * @param text The text to display.
	 * @param font The font settings to use.
	 * @param fill The fill to use.
	 * @param stroke The stroke to use.
	 */
	public constructor(text:string = "", font:TextSettings = null, fill:FillSettings = null, stroke:StrokeSettings = null)
	{
		super();

		this.text = text;
		this.font = font;
		this.fill = fill;
		this.stroke = stroke;
	}
	//#endregion




	//#region Measuring
	/**
	 * Measures the current text.
	 */
	public measure():TextMetrics
	{
		return Stage.graphics.measureText(this.text, this.font);
	}
	//#endregion


	//#region Rendering
	/** @inheritdoc */
	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.font)
		{
			let x:number = 0;

			if (this.font.align === TextAlign.Center) x += this.textArea.width / 2;
			else if (this.font.align === TextAlign.Right) x += this.textArea.width;

			//renderer.drawRect(matrix, alpha, this.textArea.x, this.textArea.y, this.textArea.width, this.textArea.height, new FillSettings("#0000FF"));

			ctx.drawText(matrix, alpha, x, 0, this.text, this.font, this.fill, this.stroke);
		}
	}
	//#endregion
}
