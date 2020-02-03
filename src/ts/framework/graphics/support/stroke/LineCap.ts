/** @file LineCap.ts */

/**
 * Enum for choosing a lineCap style.
 */
const enum LineCap
{
	/** Default value. The ends of lines are squared off at the endpoints. */
	Butt = "butt",

	/** The ends of lines are rounded. */
	Round = "round",

	/** The ends of lines are squared off by adding a box with an equal width and half the height of the line's thickness. */
	Square = "square"
}
