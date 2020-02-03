/** @file AssetEntry.ts */

/// <reference path="../lang/lang.ts" />

/**
 * Contains a parse asset entry within a bundle.
 */
interface AssetEntry
{
	/** The path of the asset. */
	path:string;

	/** The byte length. */
	length:uint;

	/** The bytes of the asset. */
	buffer:ArrayBuffer;
}
