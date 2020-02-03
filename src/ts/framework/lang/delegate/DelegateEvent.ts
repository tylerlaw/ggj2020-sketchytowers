/** @file DelegateEvent.ts */

/// <reference path="Delegate.ts" />

/**
 * A Delegate function interface which restricts functions to no return value.
 */
interface DelegateEventHandler extends Function { (...args:any[]):void; }

/**
 * Groups a set of Delegates to a single event handle.
 * When the event is invoked, each attached handler is invoked in order they are attached.
 * New Delegates added during invokaction will not be invoked.
 * Delegates not yet called during invokation which are removed will not be called.
 * Note that DelegateEvents cannot handle functors with return values
 */
class DelegateEvent<T extends DelegateEventHandler>
{
	//#region Members
	/** Gets the number of delegates attached to this delegate event. @readonly */
	public count:int = 0;

	/** Returns true if there are no delegates attached to this event. @readonly */
	public isEmpty:boolean = true;

	/** The generic invocation point for the delegate event. Note that nothing is returned! @readonly */
	public invoke:T;

	/** The set of all delegates waiting for this event */
	private readonly _delegates:Delegate<T>[] = [];

	/** Indicates if the event is currently being invoked. */
	private _invoking:boolean = false;

	/** The invokation iterator helper. */
	private _iterator:int = -1;

	/** The invokation iterator stop helper. */
	private _iteratorStop:int = -1;
	//#endregion


	//#region Constructor
	/**
	 * Constructs a new DelegateEvent.
	 */
	public constructor()
	{
		this.invoke = <any>this.fire0;
	}
	//#endregion


	//#region Access
	/**
	 * Adds the specified delegate to this event.
	 * @param method A method with signature matching T.
	 * @param scope Optional. The scope to call the following handler method on.
	 * @throws Error If the specified delegate was already added.
	 */
	public add(method:T, scope:any):void
	{
		if (this.indexOf(method, scope) >= 0) throw new Error("Tried to add a delegate that was already added!");

		this._delegates.push(new Delegate<T>(method, scope));

		if (this._delegates.length === 1) this.invoke = <any>this.fire1;
		else if (this._delegates.length >= 2) this.invoke = <any>this.fire;

		this.count = this._delegates.length;
		this.isEmpty = false;
	}

	/**
	 * Removes the specified delegate from this event.
	 * @param method A method with signature matching T.
	 * @param scope Optional. The scope to call the following handler method on.
	 * @throws Error if the specified delegate was not added.
	 */
	public remove(method:T, scope:any):void
	{
		const index:int = this.indexOf(method, scope);
		if (index < 0) throw new Error("Tried to remove a delegate that was not added!");

		this._delegates.splice(index, 1);

		if (this._invoking)
		{
			this._iteratorStop--;
			if (this._iterator >= index) this._iterator--;
		}

		if (this._delegates.length === 1) this.invoke = <any>this.fire1;
		else if (this._delegates.length === 0) this.invoke = <any>this.fire0;

		this.count = this._delegates.length;
		this.isEmpty = (this.count === 0);
	}

	/**
	 * Removes all delegates attached to this event.
	 */
	public clear():void
	{
		// Free up all the delegates just to be safe
		for (let i:int = 0; i < this._delegates.length; ++i)
		{
			this._delegates[i].clear();
		}
		this._delegates.length = 0;

		this.invoke = <any>this.fire0;

		if (this._invoking)
		{
			this._iterator = 0;
			this._iteratorStop = 0;
		}

		this.count = 0;
		this.isEmpty = true;
	}

	/**
	 * Checks to see if a specific handler is attached to this event.
	 * @param method The method to call when handling this event.
	 * @param scope Optional. The scope to call the specified method on.
	 * @returns Returns true if a delegate with the specified scope and method are waiting for this event.
	 */
	public contains(method:T, scope:any):boolean
	{
		return this.indexOf(method, scope) >= 0;
	}

	/**
	 * Returnts the index of the delegate if present, -1 if not present.
	 * @param method The method to call when handling this event.
	 * @param scope Optional. The scope to call the specified method on.
	 * @returns The 0 based index of the delegate within the delegate list, if present, otherwise -1.
	 */
	private indexOf(method:T, scope:any):int
	{
		for (let i:int = 0; i < this._delegates.length; ++i)
		{
			if (this._delegates[i].equals(method, scope)) return i;
		}
		return -1;
	}
	//#endregion


	//#region Invoking
	/**
	 * Invokation function when no delegates are attached.
	 */
	private fire0():void {}

	/**
	 * Optimized invokation function when 1 delegate is attached.
	 * @throws Error If the event was already being triggered.
	 */
	private fire1():void
	{
		if (this._invoking) throw new Error("Tried to invoke a DelegateEvent that is currently firing. Recursive events are not supported nor advised!");

		this._invoking = true;
		this._iterator = 0;
		this._iteratorStop = 1;

		this._delegates[0].invoke.apply(this._delegates[0], arguments);

		this._invoking = false;
		this._iterator = -1;
		this._iteratorStop = -1;
	}

	/**
	 * Invokation function when more than 1 delegate is attached
	 * @throws Error If the event was already being triggered.
	 */
	private fire():void
	{
		if (this._invoking) throw new Error("Tried to invoke a DelegateEvent that is currently firing. Recursive events are not supported nor advised!");

		let del:Delegate<T>;
		const a:any = arguments;
		this._iteratorStop = this._delegates.length;
		this._invoking = true;

		for (this._iterator = 0; this._iterator < this._iteratorStop; ++this._iterator)
		{
			del = this._delegates[this._iterator];
			del.invoke.apply(del, a);
		}

		this._invoking = false;
		this._iterator = -1;
		this._iteratorStop = -1;
	}
	//#endregion
}
