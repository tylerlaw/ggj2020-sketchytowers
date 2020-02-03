/** @file FontMetrics.ts */

/**
 * Defines a set of font metrics for a given font.
 * FontMetrics are used to render fonts consistently across browsers.
 */
interface FontMetrics
{
	//#region Metrics
	/** The font's ascent value. */
	readonly ascent:number;
	
	/** The font's descent value. */
	readonly descent:number;

	/** The font's unitsPerEm value. */
	readonly unitsPerEm:number;
	//#endregion
}
