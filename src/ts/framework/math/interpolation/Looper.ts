/** @file Looper.ts */

/// <reference path="Interpolator.ts" />

/**
 * Defines a basic looping behavior for an interpolator.
 */
class Looper implements ILooper
{
	/** The number of times to loop, < 0 means indefinitely. */
	public total:number = 0;
	
	/** The number of times it has looped for. */
	public count:number = 0;
	
	/** Check to see if the looper has more loops. */
	public get hasMoreLoops():boolean { return (this.total < 0 || this.count < this.total) ? true : false; }

	/** Indicates if the direction should be swapped. */
	public reverseDirection:boolean;
	
	
	public constructor(total:number = -1, reverseDirection:boolean = false)
	{
		this.total = total;
		this.reverseDirection = reverseDirection;
	}
	
	
	/**
	 * Loops the interpolator.
	 * @param interpolator The interpolator to loop.
	 * @param isForward Indicates if the interpolator 
	 */
	public loop(interpolator:Interpolator, isForward:boolean = true):void
	{
		if (isForward)
		{
			// Note that we moved a loop
			this.count++;
			
			// Remove one duration worth of current interpolation time
			interpolator.time -= interpolator.duration;
		}
		else
		{
			// Note that we moved a loop
			this.count--;

			// Add one duration worth of current interpolation time
			interpolator.time += interpolator.duration;
		}

		if (this.reverseDirection)
		{
			let tmp:number = interpolator.start;
			interpolator.start = interpolator.end;
			interpolator.end = tmp;
		}
	}
}
