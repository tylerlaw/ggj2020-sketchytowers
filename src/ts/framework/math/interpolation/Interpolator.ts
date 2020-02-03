/** @file Interpolator.ts */

/// <reference path="../../lang/delegate/DelegateEvent.ts" />
/// <reference path="Easing.ts" />
/// <reference path="Looper.ts" />

/** Interface for an object which can control how and interpolator loops. */
interface ILooper
{
	/** Indicates if there are more loops */
	hasMoreLoops:boolean;
	
	/** Handles looping. */
	loop(interpolator:Interpolator, isForward:boolean):void;
}

/** Interpolator event handler interface. */
interface InterpolatorHandler { (interpolator:Interpolator):void; }

/**
 * An interpolation control object.
 */
class Interpolator
{
	//#region Events
	/** Fired when an interpolator starts. */
	public onStarted:DelegateEvent<InterpolatorHandler> = new DelegateEvent<InterpolatorHandler>();

	/** Fired when an interpolator loops forward. */
	public onLooped:DelegateEvent<InterpolatorHandler> = new DelegateEvent<InterpolatorHandler>();

	/** Fired when an interpolator loops backwards. */
	public onReverseLooped:DelegateEvent<InterpolatorHandler> = new DelegateEvent<InterpolatorHandler>();

	/** Fired when the interpolator is finished. */
	public onFinished:DelegateEvent<InterpolatorHandler> = new DelegateEvent<InterpolatorHandler>();
	//#endregion
	
	
	//#region Members
	/** Duration of the tween (ms). Must be greater than 0. */
	public get duration():number { return this._duration; }
	public set duration(v:number) { if (v <= 0) throw new Error("Supplied duration must be greater than 0!"); this._duration = v; }
	private _duration:number = 1;
	
	/** Current playback time (ms) of the tween. */
	public time:number = 0;
	
	/** The amount to delay before starting the tween. */
	public delay:number;
	
	/** The start value to tween from. */
	public start:number;
	
	/** The ending value to tween to. */
	public end:number;
	
	/** The easing function to use. */
	public ease:EasingFunction;
	
	/** The looper behavior to use. */
	public looper:ILooper;
	
	/** Gets the current value at the interpolation time. */
	public get value():number
	{
		if (this.time <= this.delay) return this.start;
		else if (this.time - this.delay >= this.duration) return this.end;
		else return this.ease(this.time - this.delay, this.start, this.end - this.start, this._duration);
	}
	
	/** returns true iff the interpolator is finished. */
	public get isFinished():boolean
	{
		if (this.time >= this._duration + this.delay)
		{
			if (this.looper && this.looper.hasMoreLoops) return false;
			else return true;
		}
		else return false;
	}
	//#endregion
	

	//#region Constructor
	/**
	 * Creates a new Interpolator.
	 * @param start The starting value to tween from.
	 * @param end The ending value to tween to.
	 * @param duration The duration to tween for (ms).
	 * @param delay The delay before starting to tween (ms).
	 * @param ease The easing function to use.
	 * @param looper The looping behavior to use.
	 */
	public constructor(start:number, end:number, duration:number, delay:number = 0, ease:EasingFunction = null, looper:ILooper = null)
	{
		this.delay = delay;
		this.start = start;
		this.end = end;
		this.duration = duration;
		this.ease = ease ? ease : Easing.none;
		this.looper = looper;
	}
	//#endregion


	//#region Interpolation
	/**
	 * Handles looping backwards.
	 */
	private underflow():void
	{
		while (this.time < 0)
		{
			if (this.looper)
			{
				this.looper.loop(this, false);
				if (!this.onReverseLooped.isEmpty) this.onReverseLooped.invoke(this);
			}
			else
			{
				this.time = 0;
			}
		}
	}
	
	/**
	 * Handles looping forwards.
	 */
	private overflow():void
	{
		while (this.time > this._duration + this.delay)
		{
			if (this.looper && this.looper.hasMoreLoops)
			{
				this.looper.loop(this, true);
				if (!this.onLooped.isEmpty) this.onLooped.invoke(this);
			}
			else
			{
				this.time = this._duration + this.delay;
				if (!this.onFinished.isEmpty) this.onFinished.invoke(this);
			}
		}
	}
	
	/**
	 * Handles when the end is reached.
	 */
	private reachedEnding():void
	{
		if (!this.looper || !this.looper.hasMoreLoops)
		{
			if (!this.onFinished.isEmpty) this.onFinished.invoke(this);
		}
	}
	
	/**
	 * Advances the interpolation by the specified amount of time.
	 * @param elapsed The amount of time to advance by (ms).
	 * @return The new value at the updated time.
	 */
	public update(elapsed:number):number
	{
		let unstarted:boolean = false;
		if (this.time <= this.delay) unstarted = true;

		this.time += elapsed;

		if (unstarted && this.time > this.delay) this.onStarted.invoke(this);
		
		if (this.time < 0) this.underflow();
		else if (this.time === this._duration + this.delay) this.reachedEnding();
		else if (this.time > this._duration + this.delay) this.overflow();
		
		return this.value;
	}
}
