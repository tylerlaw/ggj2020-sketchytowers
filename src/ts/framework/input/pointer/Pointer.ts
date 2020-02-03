/** @file Pointer.ts */

/// <reference path="../../lang/lang.ts" />
/// <reference path="../../lang/delegate/DelegateEvent.ts" />

/** A delegate interface for handling pointer events. */
interface PointerHandler { (pointer:Pointer):void; }

/** A delegate interface for handling pointer moves. */
interface PointerMoveHandler { (pointer:Pointer, dx:number, dy:number):void; }


/** Pointer internal implementation. */
class Pointer
{
	//#region Events
	/** Fired when the pointer is pressed. */
	public readonly onPress:DelegateEvent<PointerHandler> = new DelegateEvent<PointerHandler>();

	/** Fired when the pointer moves. */
	public readonly onMove:DelegateEvent<PointerMoveHandler> = new DelegateEvent<PointerMoveHandler>();

	/** Fired when the pointer is released. */
	public readonly onRelease:DelegateEvent<PointerHandler> = new DelegateEvent<PointerHandler>();

	/** Fired when the pointer is canceled. */
	public readonly onCancel:DelegateEvent<PointerHandler> = new DelegateEvent<PointerHandler>();

	/** Fired when this pointer is marked present. */
	public readonly onPresent:DelegateEvent<PointerHandler> = new DelegateEvent<PointerHandler>();

	/** Fired when this pointer is marked NOT present. */
	public readonly onAbsent:DelegateEvent<PointerHandler> = new DelegateEvent<PointerHandler>();
	//#endregion


	//#region Members
	/** The index of this pointer in the pointinputs's pointer list. */
	public readonly index:int;

	/** The last known x position of the pointer in canvas coords. @readonly */
	public x:int = 0;

	/** The last known y position of the pointer in canvas coords. @readonly */
	public y:int = 0;

	/** Indicates if this pointer is currently pressed. @readonly */
	public isPressed:boolean = false;

	/** Indicates if this pointer is currently considered present. @readonly */
	public isPresent:boolean = false;
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Pointer.
	 * @param index The index of this pointer in the pointinputs's pointer list.
	 * @internal
	 */
	public constructor(index:int)
	{
		this.index = index;
	}
	//#endregion


	//#region Actions
	/**
	 * Handles when this pointer comes present.
	 * @internal
	 */
	public present():void
	{
		if (this.isPresent) return;
		this.isPresent = true;
		this.onPresent.invoke(this);
	}

	/**
	 * Handles when this pointer goes absent.
	 * @internal
	 */
	public absent():void
	{
		if (!this.isPresent) return;
		this.isPresent = false;
		this.onAbsent.invoke(this);
	}

	/**
	 * Handles when this pointer is pressed.
	 * @internal
	 */
	public press():void
	{
		if (this.isPressed) return;
		this.isPressed = true;
		this.onPress.invoke(this);
	}

	/**
	 * Handles when this pointer is moved.
	 * @param x The x position in canvas space.
	 * @param y The y position in canvas space.
	 * @internal
	 */
	public move(x:number, y:number):void
	{
		if (this.x !== x || this.y !== y)
		{
			const dx:number = x - this.x;
			const dy:number = y - this.y;

			this.x = x;
			this.y = y;

			this.onMove.invoke(this, dx, dy);
		}
	}

	/**
	 * Handles when this pointer is released.
	 * @internal
	 */
	public release():void
	{
		if (!this.isPressed) return;
		this.isPressed = false;
		this.onRelease.invoke(this);
	}

	/**
	 * Cancels the current press if any.
	 */
	public cancel():void
	{
		if (!this.isPressed) return;
		this.isPressed = false;
		this.onCancel.invoke(this);
	}
	//#endregion
}
