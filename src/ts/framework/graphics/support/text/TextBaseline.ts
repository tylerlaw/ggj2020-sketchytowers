/** @file TextBaseline.ts */

/**
 * Enum for choosing a textBaseline style.
 */
const enum TextBaseline
{
	/** The text baseline is the top of the em square. */
	Top = "top",

	/** The text baseline is the hanging baseline. (Used by Tibetan and other Indic scripts.) */
	//Hanging = "hanging",

	/** The text baseline is the middle of the em square. */
	Middle = "middle",

	/** The text baseline is the normal alphabetic baseline. Default value. */
	Alphabetic = "alphabetic",

	/** The text baseline is the ideographic baseline; this is the bottom of the body of the characters, if the main body of characters protrudes beneath the alphabetic baseline. (Used by Chinese, Japanese, and Korean scripts.) */
	//Ideographic = "ideographic",

	/** The text baseline is the bottom of the bounding box. This differs from the ideographic baseline in that the ideographic baseline doesn't consider descenders. */
	Bottom = "bottom"
}
