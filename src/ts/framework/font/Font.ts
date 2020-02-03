/** @file Font.ts */

/// <reference path="FontMetrics.ts" />

/**
 * Represents a font that may be used with the engine.
 */
class Font
{
	/** The font family. */
	public readonly family:string;

	/** The font weight. */
	public readonly weight:string;

	/** The font style. */
	public readonly style:string;

	/** The font variant. */
	public readonly variant:string;

	/** The metrics associated with this font. */
	public readonly metrics:FontMetrics;


	/**
	 * Defines a new Font.
	 * @param family The font family.
	 * @param weight The font weight.
	 * @param style The fonts style.
	 * @param variant The font variant.
	 * @param ascent Font metrics ascent.
	 * @param descent Font metrics descent.
	 * @param unitsPerEm Font metrics unitsPerEm.
	 * @internal
	 */
	public constructor(family:string, weight:string, style:string, variant:string, ascent?:number, descent?:number, unitsPerEm?:number)
	{
		this.family = family;
		this.weight = weight;
		this.style = style;
		this.variant = variant;
		this.metrics = { ascent: ascent || 0, descent: descent || 0, unitsPerEm: unitsPerEm || 0 };
	}
}
