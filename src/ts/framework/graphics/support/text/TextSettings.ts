/** @file TextSettings.ts */

/// <reference path="../../../font/Font.ts" />
/// <reference path="TextStyle.ts" />
/// <reference path="TextAlign.ts" />
/// <reference path="TextBaseline.ts" />

/**
 * Wraps text settings into a single class.
 */
class TextSettings
{
	//#region Members
	/** The font to use. */
	public font:Font;

	/** The font size in pixels. */
	public size:number;

	/** The text alignment. Default is start. */
	public align:TextAlign;

	/** The text baseline. Default TextBaseline.Alphabetic. */
	public baseline:TextBaseline;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Font setting.
	 * @param font The font to use.
	 * @param size The pixel size. Default 10.
	 * @param align The text alignment. Default Start.
	 * @param baseline The text baseline. Default Alphabetic.
	 */
	public constructor(font:Font, size:number = 10, align:TextAlign = TextAlign.Left, baseline:TextBaseline = TextBaseline.Top)
	{
		this.font = font;
		this.size = size;
		this.align = align;
		this.baseline = baseline;
	}
	//#endregion
}
