/** @file Sprite.ts */

/// <reference path="../math/geom/Matrix2D.ts" />

class Sprite
{
	public name:string = "Sprite (unnamed)";
	public x:number = 0;
	public y:number = 0;
	public scaleX:number = 1;
	public scaleY:number = 1;
	public skewX:number = 0;
	public skewY:number = 0;
	public rotation:number = 0;
	public regX:number = 0;
	public regY:number = 0;
	protected _wvp:Matrix2D = new Matrix2D();
	protected _pt:Vector2 = new Vector2();
	protected _xformMatrix:Matrix2D = new Matrix2D();

	public visible:boolean = true;
	public alpha:number = 1;

	public parent:Sprite = null;
	public children:Sprite[] = [];

	//#region Input
	/** The cursor property. */
	public cursor:Cursor = null;

	/** The input component for this display object. */
	public input:DisplayInputComponent = null;
	//#endregion


	public setPosition(x:number, y:number):void
	{
		this.x = x;
		this.y = y;
	}


	//#region Hierarchy
	/**
	 * Adds a child to the end of the list.
	 * @param child The child to add.
	 * @return The child that was added.
	 */
	public addChild(child:Sprite):Sprite
	{
		// Don't add self
		if (child === this) throw new Error("Cannot add an item to itself!");

		// Prevent cycles
		let parent:Sprite = this.parent;
		while (parent)
		{
			if (parent === child) throw new Error("An item cannot be added as its own descendant!");
			parent = parent.parent;
		}

		// If it has a parent already, remove it
		if (child.parent) child.parent.removeChild(child);

		// Add it
		this.children.push(child);
		child.parent = this;

		// Return the child
		return child;
	}

	/**
	 * Adds a child at the specified index.
	 * @param child The child to add.
	 * @param index The index to insert the child at.
	 * @return The child that was added.
	 * @throws Error if the supplied index is out of range.
	 */
	public addChildAt(child:Sprite, index:int):Sprite
	{
		// Don't add self
		if (child === this) throw new Error("Cannot add an item to iteself!");

		// Prevent cycles
		let parent:Sprite = this.parent;
		while (parent)
		{
			if (parent === child) throw new Error("An item cannot be added as its own descendant!");
			parent = parent.parent;
		}

		// Ensure valid range
		if (index < 0 || index > this.children.length) throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");

		// If it has a parent already, remove it
		if (child.parent) child.parent.removeChild(child);

		// Add at new index
		if (index <= 0)
		{
			// Push on to front
			this.children.unshift(child);
		}
		else if (index >= this.children.length)
		{
			// Push to end since greater than list length
			this.children.push(child);
		}
		else
		{
			// Insert at the specified point
			this.children.splice(index, 0, child);
		}
		child.parent = this;

		// Return the child
		return child;
	}

	/**
	 * Gets the index of the supplied child.
	 * @param child The child to lookup the index of.
	 * @return The index of the child or a number < 0 if the supplied node is not a child.
	 * @throws Error if child is not actually a child of this container.
	 */
	public getChildIndex(child:Sprite):int
	{
		// Get the current index
		const index:int = this.children.indexOf(child);

		// Ensure a child
		if (index < 0) throw new Error("Sprite is not a child of this Container!");

		// Return the index
		return index;
	}

	/**
	 * Moves the child to the specified index.
	 * @param child The child to move.
	 * @param index The new index to move to.
	 * @throws Error if index is out of range.
	 * @throws Error if child is not actually a child of this node.
	 */
	public setChildIndex(child:Sprite, index:int):void
	{
		// Ensure valid range
		if (index < 0 || index >= this.children.length) throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");

		// Get the current index
		const curr:number = this.children.indexOf(child);

		// Ensure is a child
		if (curr < 0) throw new Error("Sprite is not a child of this Container!");

		// Move as needed
		if (curr !== index)
		{
			// Remove from current index
			this.children.splice(curr, 1);
			
			// Add at new index
			if (index <= 0)
			{
				// Push on to front
				this.children.unshift(child);
			}
			else if (index >= this.children.length)
			{
				// Push to end since greater than list length
				this.children.push(child);
			}
			else
			{
				// Insert at the specified point
				this.children.splice(index, 0, child);
			}
		}
	}

	/**
	 * Swaps the position of 2 display objects within this container.
	 * @param child1 The first child to swap.
	 * @param child2 The second child to swap.
	 */
	public swapChildren(child1:Sprite, child2:Sprite):void
	{
		// Get indexes
		const index1:int = this.children.indexOf(child1);
		const index2:int = this.children.indexOf(child2);

		// Ensure children
		if (index1 < 0 || index2 < 0) throw new Error("Sprite is not a child of this Container!");

		// Swap if needed
		if (index1 !== index2)
		{
			this.children[index1] = child2;
			this.children[index2] = child1;
		}
	}

	/**
	 * Gets the child at the specified index.
	 * @param index The index of the child to return.
	 * @return The child at that index.
	 * @throws Error if index is out of range.
	 */
	public getChildAt(index:int):Sprite
	{
		// Ensure valid range
		if (index < 0 || index >= this.children.length) throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");

		// Return the index
		return this.children[index];
	}

	/**
	 * Removes the specified child from the list.
	 * @param child The child to remove.
	 * @return the removed child.
	 * @throws Error if child is not a child of this node.
	 */
	public removeChild(child:Sprite):Sprite
	{
		// Get the current index
		const curr:number = this.children.indexOf(child);

		// Ensure is a child
		if (curr < 0) throw new Error("Sprite is not a child of this Container!");

		// Remove it
		this.children.splice(curr, 1);
		child.parent = null;

		// Return it
		return child;
	}

	/**
	 * Removes a child at the specified index.
	 * @param index The index to remove the child at.
	 * @return The child that was removed.
	 * @throws Error if index is out of range.
	 */
	public removeChildAt(index:int):Sprite
	{
		// Ensure valid range
		if (index < 0 || index >= this.children.length) throw new Error("Index (" + index + ") out of range [0, " + this.children.length + "]!");

		// Remove it
		const child:Sprite = this.children.splice(index, 1)[0];
		child.parent = null;

		// Return the removed child
		return child;
	}
	//#endregion


	/** @inheritdoc */
	public pick(matrix:Matrix2D, globalX:number, globalY:number, mode:PickMode):Sprite
	{
		if (mode !== PickMode.PointerInput || !this.input || (this.input && this.input.pointerChildrenEnabled))
		{
			let child:Sprite;
			for (let i:number = this.children.length - 1; i >= 0; --i)
			{
				child = this.children[i];

				if (!child.visible
					|| child.alpha <= 0
					|| child.scaleX === 0 || child.scaleY === 0
				) continue;

				if (mode === PickMode.PointerInput && child.input && !child.input.pointerEnabled && !child.input.pointerChildrenEnabled) continue;

				child = (<Sprite>child).pick(
					this._wvp.copy(matrix).appendTransform(child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY, child.regX, child.regY),
					globalX,
					globalY,
					mode
				);
				if (child) return child;
			}
		}

		if (mode === PickMode.PointerInput && this.input && this.input.pointerEnabled && this.input.hitArea)
		{
			this._wvp.copy(matrix).invert().transformVector(this._pt.set(globalX, globalY));
			if (this.input.hitArea.containsVector(this._pt)) return this;
		}

		return null;
	}


	//#region Transformations
	/**
	 * Deforms the passed in matrix to be the global matrix to this display object.
	 * @param matrix The matrix to deform. If one is not supplied, a new one is created.
	 */
	public getConcatenatedMatrix(matrix?:Matrix2D):Matrix2D
	{
		matrix = matrix || new Matrix2D();

		matrix.setTransform(this.x, this.y, this.scaleX, this.scaleY, this.rotation, this.skewX, this.skewY, this.regX, this.regY);

		let o:Sprite = this.parent;
		while (o)
		{
			matrix.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY);
			o = o.parent;
		}
		// Prepend the stage scale factor
		// TODO: FUTURE - this could be optimized
		matrix.prependTransform(0, 0, Stage.scale, Stage.scale, 0, 0, 0, 0, 0);

		return matrix;
	}

	/**
	 * Deforms the passed in vector from global coords to local coords.
	 * Returns the same vector for chaining
	 * @param vec The vector to transform.
	 */
	public globalToLocal(vec:Vector2):Vector2
	{
		return this.getConcatenatedMatrix(this._xformMatrix).invert().transformVector(vec);
	}
	//#endregion


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		let child:Sprite;
		for (let i:number = 0; i < this.children.length; ++i)
		{
			child = this.children[i];

			if (child.visible && child.alpha > 0 && child.scaleX !== 0 && child.scaleY !== 0)
			{
				child.render(
					ctx,
					this._wvp.concat(matrix, child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY, child.regX, child.regY),
					alpha * child.alpha
				);
			}
		}
	}
}
