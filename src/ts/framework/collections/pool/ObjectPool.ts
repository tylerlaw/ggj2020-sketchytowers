/** @file ObjectPool.ts */

/// <reference path="../../lang/lang.ts" />

/**
 * A generic object pool.
 * NOTE: This is not totally safe, you could add the same object to the pool twice.
 * 	This unsafe behavior is by design for performance reasons.
 * @template T the type of the object to store in the pool
 */
class ObjectPool<T extends Object>
{
	/** The set of items in the pool. */
	private readonly _pool:T[] = [];

	/** The number of items in the pool */
	public get count():int { return this._count; }
	private _count:int = 0;


	/**
	 * Removes an item from the pool.
	 * @return An item from the pool or null if there are no free items.
	 */
	public remove():T
	{
		let item:T = null;

		// If we have an item, take it out
		if (this._count > 0)
		{
			item = this._pool[this._count - 1];
			this._pool[this._count - 1] = null;
			this._count--;
		}

		return item;
	}

	/**
	 * Adds the specified item to the pool.
	 * @param item The item to add.
	 */
	public add(item:T):void
	{
		if (!item) throw new Error("Cannot add null or empty to pool!");

		if (this._pool.length > this._count) this._pool[this._count] = item;
		else this._pool.push(item);
		this._count++;
	}
}
