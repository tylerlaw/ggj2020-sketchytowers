/** @file Delegate.ts */

/// <reference path="Handler.ts" />

/**
 * A functor that wraps a function of the supplied type signature.
 */
class Delegate<T extends Function>
{
	//#region Members
	/** The handler method to call. @readonly */
	public method:T;

	/** The scope to call the handler method on. @readonly */
	public scope:any;

	/** Returns true if a delegate is currently set with a function and a scope. @readonly */
	public isSet:boolean;

	/** The generic invocation point for a delegate. @readonly */
	public invoke:T;
	//#endregion


	//#region Constructor
	/**
	 * Creates an instance of Delegate that starts out as unset.
	 * @param method Optional if no scope is supplied. A method with signature matching T.
	 * @param scope Optional. The scope to call the following handler method on.
	 * @throws Error If a scope is supplied without a method no method is supplied.
	 */
	public constructor(method?:T, scope?:any)
	{
		if (scope || method) this.set(method, scope);
		else this.clear();
	}
	//#endregion


	//#region Setting
	/**
	 * Sets a delegate to call a specified method on a specified scope.
	 * @param method A method with signature matching T.
	 * @param scope Optional. The scope to call the following handler method on.
	 * @throws Error If the delegate is already set. It must be cleared first.
	 * @throws Error If no method is supplied.
	 */
	public set(method:T, scope:any = null):void
	{
		if (this.scope || this.method) throw new Error("An existing delegate handler must be cleared before a new one can be set!");
		if (!method) throw new Error("Method must be defined! Use clear() to unset a delegate.");

		this.method = method;
		this.scope = scope;
		this.isSet = true;
		this.invoke = <any>this.fire;
	}

	/**
	 * Clears a delegate of its currently set method and scope if any.
	 */
	public clear():void
	{
		this.method = null;
		this.scope = null;
		this.isSet = false;
		this.invoke = <any>this.unset;
	}
	//#endregion


	//#region Invoking
	/**
	 * Helper method that is called if an unset delegate is invoked.
	 * @throws Error If called. 
	 */
	private unset():void
	{
		throw new Error("Tried to invoke a delegate that was not set!");
	}

	/**
	 * Helper method to fire off a set delegate.
	 * @param arguments Any set of arguments to be used when calling the wrapped function.
	 * @returns The return value of the wrapped function.
	 */
	private fire():any
	{
		return this.method.apply(this.scope, arguments);
	}
	//#endregion


	//#region Equatable
	/**
	 * Returns true iff the supplied scope and method match the currently set handler.
	 * @param method The method to check for.
	 * @param scope The scope to check for.
	 * @returns True iff the supplied params match the current handler settings.
	 */
	public equals(method:T, scope:any = null):boolean
	{
		return (this.scope === scope && this.method === method);
	}
	//#endregion
}
