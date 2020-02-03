/** @file GameScreenManager.ts */

/// <reference path="GameScreen.ts" />

/**
 * A GameScreenManager.
 */
class GameScreenManager
{
	//#region Members
	/** The set of screens currently in the screen manager. */
	private readonly _list:GameScreen[] = [];
	
	/** An iterator. */
	private _iterator:number = -1;
	
	/** A reverser iterator. */
	private _reverseIterator:number = -1;
	
	/** The number of screens in the list. */
	private _count:number = 0;
	
	/** The root container all screens will be held in. */
	public display:Sprite = new Sprite();
	//#endregion
	
	
	//#region Constructor
	/**
	 * Creates a new screen manager.
	 */
	public constructor()
	{
		this.display.name = "screenManager.display";
	}
	//#endregion


	//#region Screens
	/**
	 * Safely adds a screen to the top of the stack.
	 * @param screen The screen to add.
	 */
	public add(screen:GameScreen):void
	{
		let s:any = screen;
		
		if (s.isActive) throw new Error("GameScreen is already added to the screen manager!");
		if (s._isDisposed) throw new Error("GameScreen is disposed!");
		s._isExiting = false;
		s._isActive = true;
		s._isFocused = false;
		s._isOccluded = true;
		s.screenManager = this;
		
		this._list.push(s);
		this._count++;
		
		this.display.addChild(s._display);
		if (!s._isInitialized) s.initialize();
		s.added();
		
		this.updateScreenState();
	}

	/**
	 * Safely adds a screen to the stack behind the supplied screen.
	 * @param screen The screen to add.
	 * @param overScreen The screen to insert behind.
	 */
	public addBehind(screen:GameScreen, overScreen:GameScreen):void
	{
		let s:any = screen;

		if (!overScreen.isActive) throw new Error("overScreen is not in the screen manager!");
		
		if (s.isActive) throw new Error("GameScreen is already added to the screen manager!");
		if (s._isDisposed) throw new Error("GameScreen is disposed!");
		s._isExiting = false;
		s._isActive = true;
		s._isFocused = false;
		s._isOccluded = true;
		s.screenManager = this;
		
		//this._list.push(s);
		const index:number = this._list.indexOf(overScreen);
		if (index === 0) this._list.unshift(screen);
		else this._list.splice(index, 0, screen);
		this._count++;

		if (index <= this._iterator) this._iterator++;					// avoid updating same one twice
		if (index <= this._reverseIterator) this._reverseIterator++;
		
		this.display.addChildAt(s._display, index);
		if (!s._isInitialized) s.initialize();
		s.added();
		
		this.updateScreenState();
	}

	/**
	 * Safely removes a screen from the stack.
	 * @param screen The screen to remove
	 */
	public remove(screen:GameScreen):void
	{
		let s:any = screen;
		
		if (!screen.isActive) throw new Error("GameScreen is not in the screen manager!");
		
		if (screen.isFocused) s.loseFocus();
		if (!screen.isOccluded) s.hide();
		s.removed();
		
		let index:number = this._list.indexOf(screen);
		if (index >= 0)
		{
			this._list.splice(index, 1);
			this._count--;
			if (index <= this._iterator) this._iterator--;
			if (index <= this._reverseIterator) this._reverseIterator--;
		}
		
		this.display.removeChild(screen.display);
		s._isActive = false;
		s.screenManager = null;
		
		screen.onRemoved.invoke(screen);
		
		this.updateScreenState();
	}

	/**
	 * Removes all screens from the stack.
	 */
	public removeAll():void
	{
		while (this._list.length > 0) this.remove(this._list[this._list.length - 1]);
	}
	//#endregion


	//#region GameScreen State
	/**
	 * Updates the input and visibility state of each screen in the stack.
	 */
	private updateScreenState():void
	{
		if (this._reverseIterator !== -1) throw new Error("Already iterating!");
		
		let focusAvailable:boolean = true;
		let occluding:boolean = false;
		let inputAvailable:boolean = true;
		for (this._reverseIterator = this._count - 1; this._reverseIterator >= 0; this._reverseIterator--)
		{
			let value:any = this._list[this._reverseIterator];
			
			if (inputAvailable)
			{
				if (!value._isInputAllowed)
				{
					value._isInputAllowed = true;
					value.refreshInputState();
				}
				if (value._isModal) inputAvailable = false;
			}
			else
			{
				if (value._isInputAllowed)
				{
					value._isInputAllowed = false;
					value.refreshInputState();
				}
			}
			
			if (focusAvailable)
			{
				if (!value._isFocused)
				{
					value.gainFocus();
				}
				if (value._isModal) focusAvailable = false;
			}
			else
			{
				if (value._isFocused) value.loseFocus();
			}
			
			if (!occluding)
			{
				if (value._isOccluded) value.show();
				if (!value._isPopup) occluding = true;
			}
			else
			{
				if (!value._isOccluded) value.hide();
			}
		}
		this._reverseIterator = -1;
	}
	//#endregion


	//#region Updating
	/**
	 * Calls update on each screen in the stack from top to bottom.
	 * @param elapsed The elapsed game time since the last update.
	 */
	public update(elapsed:number):void
	{
		if (this._iterator !== -1) throw new Error("already iterating!");
		
		for (this._iterator = 0; this._iterator < this._count; ++this._iterator)
		{
			this._list[this._iterator].update(elapsed);
		}
		this._iterator = -1;
	}
	//#endregion


	//#region Drawing
	/**
	 * Calls the draw function on each screen in the stack from bottom to top.
	 * This function is really meant for any necessary post update processes that require the scene to be updated before making visual changes.
	 */
	public draw():void
	{
		this.updateScreenState();
		
		if (this._iterator !== -1) throw new Error("already iterating!");
		
		for (this._iterator = 0; this._iterator < this._count; ++this._iterator)
		{
			this._list[this._iterator].draw();
		}
		this._iterator = -1;
	}
	//#endregion


	//#region Debug
	/**
	 * Returns a debug string to print the screen manager.
	 * @return a string describing the screen manager.
	 */
	public toString():string
	{
		let str:string = "ScreenManager:";
		for (let i:number = this._list.length - 1; i >= 0; --i)
		{
			str += "\n    " + this._list[i];
		}
		return str;
	}
	//#endregion
	
}
