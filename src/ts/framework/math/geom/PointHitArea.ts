/** @file PointHitArea.ts */

/**
 * A hit area interface that describes how an object must behave to server as a point hit area.
 */
interface PointHitArea
{
	/**
	 * Must return true if the point is completely within the hit area.
	 * @param v The point to test.
	 * @return true if the point is completely contained in this area.
	 */
	containsVector(v:Vector2):boolean;
}
