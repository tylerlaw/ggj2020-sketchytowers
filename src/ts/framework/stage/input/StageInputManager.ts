/** @file StageInputManager.ts */

/// <reference path="../../lang/lang.ts" />
/// <reference path="../../collections/list/LinkedList.ts" />
/// <reference path="../../collections/pool/ObjectPool.ts" />
/// <reference path="../../input/pointer/PointerInput.ts" />
/// <reference path="DisplayInputComponent.ts" />
/// <reference path="../support/PickMode.ts" />

/**
 * Stage component class for handling input.
 * Only one of these should be created by the stage.
 * Known Quirks:
 * 	- if the display object is edited and then returned back to the same state in between updates, the component assumes that its state is still valid
 */
class StageInputManager
{
	//#region Members
	/** A set of interactions chains that are used to track over state. */
	private readonly _pointChains:LinkedList<LinkedListNode<Sprite>>[] = [new LinkedList<LinkedListNode<Sprite>>(), new LinkedList<LinkedListNode<Sprite>>()];

	/** The chain of items that are currenly considered "over". */
	private _pointChain:LinkedList<LinkedListNode<Sprite>>;

	/** Helper chain used to find differences in the previous pointer chain and the new one. */
	private _nextPointChain:LinkedList<LinkedListNode<Sprite>>;

	/** A helper index indicating which chain in the array is currently marked as the current pointer chain. */
	private _pointChainIndex:int = 0;

	/** A chain of objects that were recent pressed. */
	private readonly _pressChain:LinkedList<LinkedListNode<Sprite>> = new LinkedList<LinkedListNode<Sprite>>();

	/** Indicates if the pointer is currently pressed. */
	private _pressed:boolean = false;

	/** The last cursor that was set by this component. */
	private _cursor:Cursor = null;

	/** An object pool for interaction chains. */
	private readonly _pool:ObjectPool<LinkedListNode<Sprite>> = new ObjectPool<LinkedListNode<Sprite>>();
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Stage Input Component.
	 */
	public constructor()
	{
		this._pointChain = this._pointChains[0];
		this._nextPointChain = this._pointChains[1];

		PointerInput.primary.onPress.add(this.PointerInput_primary_onPress, this);
		PointerInput.primary.onRelease.add(this.PointerInput_primary_onRelease, this);
		PointerInput.primary.onCancel.add(this.PointerInput_primary_onCancel, this);
	}
	//#endregion


	//#region Frames
	/**
	 * Should be called at the start of every frame to update pointer chain.
	 */
	public beginFrame():void
	{
		this.point();
	}
	//#endregion


	//#region Interactions
	/**
	 * Updates the pointer chain and dispatches over / out events.
	 * Also updates the cursor.
	 * Algorithm:
	 * 	- build a new point chain by picking on the stage at the pointer coordinates
	 * 	- check if the lists match and top most common parent
	 * 	- dispatch out events on the oldChain.leaf up to common parent
	 * 	- dispatch over events on newChain.leaf up to common parent
	 * 	- find the deepest over object that has a cursor set and apply that or use the stage default cursor.
	 * 	- make newChain the current point chain
	 * 	- free the old point chain
	 */
	public point():void
	{
		// Decalare working vars
		let newNode:LinkedListNode<Sprite>;		// Iterator value
		let oldNode:LinkedListNode<Sprite>;		// Iterator value
		let displayObject:Sprite;				// Iterator value
		let commonFound:boolean;						// Iterator state helper
		let oldTarget:Sprite;					// Target of the old list
		let newTarget:Sprite;					// Target of the new list
		let commonTarget:Sprite;					// Common parent of new and old target, if any
		let listChanged:boolean;						// Indicates if there was a difference in the pointer chains
		let cursor:Cursor = null;						// The cursor to set

		// Find targets
		newTarget = PointerInput.primary.isPresent ? Stage.pick(PointerInput.primary.x, PointerInput.primary.y, PickMode.PointerInput) : null;
		oldTarget = this._pointChain.last ? this._pointChain.last.value : null;

		// Build the new point chain and identify the deepest set cursor
		displayObject = newTarget;
		while (displayObject)
		{
			// Get a node
			let node:LinkedListNode<Sprite> = this._pool.remove() || new LinkedListNode<Sprite>();
			node.value = displayObject;

			// Prepend it to the list
			this._nextPointChain.prepend(node);

			// Set the cursor
			cursor = cursor || displayObject.cursor;

			// Move up
			displayObject = displayObject.parent;
		}

		// Check to see if the lists match and find the common parent target by iterating down each list until a mismatch is found
		commonTarget = null;
		oldNode = this._pointChain.first;
		newNode = this._nextPointChain.first;
		listChanged = (oldNode === null && newNode === null) ? false : true;	// if lists are both empty, it hasn't changed, otherwise assume changed and check if same in loop
		while (oldNode && newNode && oldNode.value === newNode.value)
		{
			// Both nodes exist and have same value, so this is a common target
			commonTarget = oldNode.value;

			// Move down
			oldNode = oldNode.next;
			newNode = newNode.next;

			// If we've hit the end of both old and new, then the lists haven't changed
			if (!oldNode && !newNode) listChanged = false;
		}

		// Iterate up old list dispatching out events while also freeing the list
		commonFound = false;
		oldNode = this._pointChain.last;
		while (oldNode)
		{
			// Handle pointer out
			if (listChanged)
			{
				if (oldNode.value.input && !oldNode.value.input.onPointerOut.isEmpty) oldNode.value.input.onPointerOut.invoke(oldNode.value, oldTarget);
			}

			// Handle roll out
			if (!commonFound)
			{
				if (oldNode.value !== commonTarget)
				{
					if (oldNode.value.input && !oldNode.value.input.onPointerRollOut.isEmpty) oldNode.value.input.onPointerRollOut.invoke(oldNode.value, oldTarget);
				}
				else
				{
					commonFound = true;
				}
			}

			// Free the node
			oldNode.value = null;
			this._pool.add(oldNode);	// Return the node to the pool

			// Move up
			oldNode = oldNode.previous;
		}
		this._pointChain.clear();	// Clear the old point chain, this wipes the next, prev, and list refs

		// Iterate up new lists dispatching over events
		commonFound = false;
		newNode = this._nextPointChain.last;
		while (newNode)
		{
			// Handle roll over
			if (!commonFound)
			{
				if (newNode.value !== commonTarget)
				{
					if (newNode.value.input && !newNode.value.input.onPointerRollOver.isEmpty) newNode.value.input.onPointerRollOver.invoke(newNode.value, newTarget);
				}
				else
				{
					commonFound = true;
				}
			}

			// Handle pointer over
			if (listChanged)
			{
				if (newNode.value.input && !newNode.value.input.onPointerOver.isEmpty) newNode.value.input.onPointerOver.invoke(newNode.value, newTarget);
			}

			// Move up
			newNode = newNode.previous;
		}

		// Swap point chains
		if (this._pointChainIndex === 0)
		{
			this._pointChain = this._pointChains[1];
			this._nextPointChain = this._pointChains[0];
			this._pointChainIndex = 1;
		}
		else
		{
			this._pointChain = this._pointChains[0];
			this._nextPointChain = this._pointChains[1];
			this._pointChainIndex = 0;
		}

		// Update the cursor
		if (!cursor) cursor = Stage.defaultCursor;
		if (this._cursor !== cursor)
		{
			this._cursor = cursor;

			Stage.canvas.style.cursor = cursor;
		}
	}

	/**
	 * Dispatches press events when the pointer is pressed.
	 * Algorithm:
	 * 	- Copy the point chain into a new press chain
	 * 	- Dispatch press on everything in the new press chain
	 */
	public press():void
	{
		// This shouldn't happen, but if we're already pressed, cancel the existing one before creating a new one
		if (this._pressed) this.cancel();

		// Set as pressed
		this._pressed = true;

		// Update point chain
		this.point();

		// Copy new point chain into press chain
		let pointNode:LinkedListNode<Sprite> = this._pointChain.last;
		let pressNode:LinkedListNode<Sprite>;
		while (pointNode)
		{
			// Get or create a node, init it, and prepend it to the chain
			pressNode = this._pool.remove() || new LinkedListNode<Sprite>();
			pressNode.value = pointNode.value;
			this._pressChain.prepend(pressNode);

			// Move up
			pointNode = pointNode.previous;
		}

		// Dispatch press events on everything in the press chain
		pressNode = this._pressChain.last;
		let newTarget:Sprite = pressNode ? pressNode.value : null;
		while (pressNode)
		{
			// Dispatch press
			if (pressNode.value.input && !pressNode.value.input.onPointerPress.isEmpty) pressNode.value.input.onPointerPress.invoke(pressNode.value, newTarget);

			// Move up
			pressNode = pressNode.previous;
		}
	}

	/**
	 * Dispatches release and cancel events on the press chain when the pointer is released.
	 * Algorithm:
	 * 	- check if chains match exactly
	 * 	- find common parent
	 * 	if chains match exactly
	 * 		- dispatch release on everything
	 * 		- distpatch click on everything
	 * 	if chains are a mismatch
	 * 		loop(press chain leaf -> common parent)
	 * 			cancel
	 * 		- free the press chain
	 * 		loop(current chain leaf -> root)
	 * 			release
	 */
	public release():void
	{
		// Set as unpressed
		this._pressed = false;

		// Update point chain
		this.point();

		// Decalare working vars
		let newNode:LinkedListNode<Sprite>;		// Iterator value for current point chain
		let oldNode:LinkedListNode<Sprite>;		// Iterator value for pressed chain
		let commonFound:boolean;						// Iterator state helper
		let oldTarget:Sprite;					// Target of the old list
		let newTarget:Sprite;					// Target of the new list
		let commonTarget:Sprite;					// Common parent of new and old target, if any
		let listChanged:boolean;						// Indicates if there was a difference in the pointer chains

		// Check to see if the lists match and find the common parent target by iterating down each list until a mismatch is found
		commonTarget = null;
		oldNode = this._pressChain.first;
		newNode = this._pointChain.first;
		listChanged = (oldNode === null && newNode === null) ? false : true;	// if lists are both empty, it hasn't changed, otherwise assume changed and check if same in loop
		while (oldNode && newNode && oldNode.value === newNode.value)
		{
			// Both nodes exist and have same value, so this is a common target
			commonTarget = oldNode.value;

			// Move down
			oldNode = oldNode.next;
			newNode = newNode.next;

			// If we've hit the end of both old and new, then the lists haven't changed
			if (!oldNode && !newNode) listChanged = false;
		}

		// Dispatch cancel / release / click events
		if (!listChanged)
		{
			// If the lists match, then we only need to dispatch release and click on everything, so iterate up the chain and free it as we go
			oldNode = this._pressChain.last;
			oldTarget = oldNode ? oldNode.value : null;
			while (oldNode)
			{
				// Dispatch release
				if (oldNode.value.input && !oldNode.value.input.onPointerRelease.isEmpty) oldNode.value.input.onPointerRelease.invoke(oldNode.value, oldTarget);

				// Dispatch click
				if (oldNode.value.input && !oldNode.value.input.onPointerClick.isEmpty) oldNode.value.input.onPointerClick.invoke(oldNode.value, oldTarget);

				// Free the node
				oldNode.value = null;
				this._pool.add(oldNode);

				// Move up
				oldNode = oldNode.previous;
			}
			this._pressChain.clear();	// Clear the old press chain, this wipes the next, prev, and list refs
		}
		else
		{
			// If the lists are a partial match or less we need to dispatch cancel events on those which are not in the new point (release) chain, free it as we go
			commonFound = false;
			oldNode = this._pressChain.last;
			oldTarget = oldNode ? oldNode.value : null;
			while (oldNode)
			{
				if (!commonFound && oldNode.value !== commonTarget)
				{
					// Nodes that were not in the new point chain on (below the common target) get canceled
					if (oldNode.value.input && !oldNode.value.input.onPointerCancel.isEmpty) oldNode.value.input.onPointerCancel.invoke(oldNode.value, oldTarget);		// provide with original target since that is where it originates
				}
				else
				{
					commonFound = true;
				}

				// Free the node
				oldNode.value = null;
				this._pool.add(oldNode);	// Return the node to the pool

				// Move up
				oldNode = oldNode.previous;
			}
			this._pressChain.clear();	// Clear the old press chain, this wipes the next, prev, and list refs

			// Dispatch release events on everything in the new point chain (release chain)
			newNode = this._pointChain.last;
			newTarget = newNode ? newNode.value : null;
			while (newNode)
			{
				// Dispatch release
				if (newNode.value.input && !newNode.value.input.onPointerRelease.isEmpty) newNode.value.input.onPointerRelease.invoke(newNode.value, newTarget);

				// Move up
				newNode = newNode.previous;
			}
		}
	}

	/**
	 * Dispatches cancel events when the pointer in canceled.
	 * Algorithm:
	 * 	- dispatch cancel on existing press chain
	 * 	- free existing press chain
	 */
	public cancel():void
	{
		// Set as unpressed
		this._pressed = false;

		// We only need to clear all presses so iterate up the press chain triggering cancel events and clear the chain as we go
		let oldNode:LinkedListNode<Sprite> = this._pressChain.last;
		let oldTarget:Sprite = oldNode ? oldNode.value : null;
		while (oldNode)
		{
			// Dispatch cancels
			if (oldNode.value.input && !oldNode.value.input.onPointerCancel.isEmpty) oldNode.value.input.onPointerCancel.invoke(oldNode.value, oldTarget);

			// Free the node
			oldNode.value = null;
			this._pool.add(oldNode);

			// Move Up
			oldNode = oldNode.previous;
		}
		this._pressChain.clear();	// Clear the press chain, this wipes the next, pref, and list refs
	}
	//#endregion


	//#region Event Handlers
	/**
	 * Handles when the primary pointer has been pressed.
	 */
	private PointerInput_primary_onPress():void
	{
		// console.log("press -- ");
		this.press();
	}

	/**
	 * Handles when the primary pointer has been released.
	 */
	private PointerInput_primary_onRelease():void
	{
		// console.log("release --");
		this.release();
	}

	/**
	 * Handles when the primary pointer press has been canceled.
	 */
	private PointerInput_primary_onCancel():void
	{
		// console.log("cancel --");
		this.cancel();
	}
	//#endregion

}
