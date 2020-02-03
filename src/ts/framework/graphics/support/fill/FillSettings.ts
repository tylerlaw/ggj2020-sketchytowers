/** @file FillSettings.ts */

/// <reference path="FillStyle.ts" />

/**
 * Wraps fill settings into a single class
 */
class FillSettings
{
	//#region Members
	/** The fill style to use. Default #000. */
	public style:FillStyle;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new fill style.
	 * @param style The fill style to use.
	 */
	public constructor(style:FillStyle = "#000000")
	{
		this.style = style;
	}
	//#endregion
}
