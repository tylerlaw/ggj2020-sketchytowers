/** @file Cursor.ts */

/**
 * An enumeration of the available cursors.
 */
const enum Cursor
{
	/** No cursor */
	None = "none",

	/** Default (arrow). */
	Default = "default",

	/** Pointer finter. */
	Pointer = "pointer",

	/** Arrow with question mark. */
	Help = "help",

	/** Text cursor. */
	Text = "text",

	/** Circle with line through it. */
	NotAllowed = "not-allowed",

	/** Open hand. */
	Grab = "grab",

	/** Closed hand. */
	Grabbing = "grabbing"
}
