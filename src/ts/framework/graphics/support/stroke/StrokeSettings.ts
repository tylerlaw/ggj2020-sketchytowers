/** @file StrokeSettings.ts */

/// <reference path="StrokeStyle.ts" />
/// <reference path="LineCap.ts" />
/// <reference path="LineJoin.ts" />

/**
 * Wraps stroke settings into a single class
 */
class StrokeSettings
{
	//#region Members
	/** The stroke style to use. Default #000. */
	public style:StrokeStyle;

	/** The line width to use. Default 1. Positive, non-zero float only. */
	public width:number;

	/** The cap to use. Default Butt. */
	public cap:LineCap;

	/** The dash settings to use. Set to empty array to clear dash. Default []. Should not be null. */
	public dash:number[];

	/** The dash offset to use. Default 0. */
	public dashOffset:number;

	/** The line join style to use. Default Miter. */
	public join:LineJoin;

	/** The line miter limit size. Default is 10. Positive, non-zero float only. */
	public miter:number;

	/** Indicates if this stroke should be rendered under (true) or over the fill (false). */
	public underFill:boolean;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new stroke settings.
	 * @param style The stroke style to use.
	 * @param width The stroke width to use.
	 * @param underFill Indicates if the stroke should be drawn under the fill (opposite of normal). Default false.
	 * @param cap The line cap to use.
	 * @param dash The line dash pattern to use.
	 * @param dashOffset The line dash offset to use.
	 * @param join The line join setting.
	 * @param miter The line miter setting.
	 */
	public constructor(style:StrokeStyle = "#000000", width:number = 1, underFill:boolean = false, cap:LineCap = LineCap.Butt, dash:number[] = [], dashOffset:number = 0, join:LineJoin = LineJoin.Miter, miter:number = 10)
	{
		this.style = style;
		this.width = width;
		this.underFill = underFill;
		this.cap = cap;
		this.dash = dash;
		this.dashOffset = dashOffset;
		this.join = join;
		this.miter = miter;
	}
	//#endregion
}
