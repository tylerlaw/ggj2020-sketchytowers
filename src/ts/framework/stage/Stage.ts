/** @file Stage.ts */

/// <reference path="../math/geom/Rectangle.ts" />
/// <reference path="../graphics/GraphicsContext.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="Bitmap.ts" />
/// <reference path="TextField.ts" />
/// <reference path="Button.ts" />
/// <reference path="input/StageInputManager.ts" />

// tslint:disable-next-line: typedef
const Stage = new (class
{
	public dirty:boolean = true;
	public width:number = 1;
	public height:number = 1;
	public cssRect:Rectangle = new Rectangle();
	public scale:number = 1;
	public canvas:HTMLCanvasElement;
	public readonly refWidth:number = 1920;
	public readonly refHeight:number = 1080;
	public root:Sprite;
	public graphics:GraphicsContext;
	private readonly _wvp:Matrix2D = new Matrix2D();
	private readonly _pickTransform:Matrix2D = new Matrix2D();
	public letterbox:boolean = true;
	public defaultCursor:Cursor = Cursor.Default;
	public inputManager:StageInputManager;


	public initialize():void
	{
		this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
		this.root = new Sprite();

		GameWindow.onResized.add(this.GameWindow_onResized, this);

		this.canvas.style.background = "#000000";

		this.graphics = new GraphicsContext(this.canvas);

		this.inputManager = new StageInputManager();

		this.beginFrame();
	}

	private GameWindow_onResized():void
	{
		this.dirty = true;
	}

	public beginFrame():void
	{
		if (this.dirty)
		{
			this.dirty = false;

			if (this.letterbox)
			{
				// CSS Letterboxing
				let cssWidth:number = Math.ceil(GameWindow.width);
				let cssHeight:number = Math.ceil(GameWindow.height);
				let cssScale:number = Math.min(cssWidth / this.refWidth, cssHeight / this.refHeight);
				cssWidth = Math.ceil(cssScale * this.refWidth);
				cssHeight = Math.ceil(cssScale * this.refHeight);
				let cssTop:number = Math.round((GameWindow.height - cssHeight) / 2);
				let cssLeft:number = Math.round((GameWindow.width - cssWidth) / 2);
				this.cssRect.set(cssLeft, cssTop, cssWidth, cssHeight);
				this.canvas.style.top = cssTop + "px";
				this.canvas.style.left = cssLeft + "px";
				this.canvas.style.width = cssWidth + "px";
				this.canvas.style.height = cssHeight + "px";

				// Pixel Density scaling
				let cvsWidth:number = Math.ceil(cssWidth * GameWindow.pixelRatio);
				let cvsHeight:number = Math.ceil(cssHeight * GameWindow.pixelRatio);
				this.graphics.resize(cvsWidth, cvsHeight);

				// Uniform content scaling
				const sx:number = this.graphics.width / this.refWidth;
				const sy:number = this.graphics.height / this.refHeight;
				this.scale = Math.min(sx, sy);
				this.width = this.graphics.width / this.scale;
				this.height = this.graphics.height / this.scale;

				/*
				this.width = Math.ceil(cssWidth * GameWindow.pixelRatio);
				this.height = Math.ceil(cssHeight * GameWindow.pixelRatio);
				this.scale = this.width / this.refWidth;

				// Canvas should match the stage width and height
				this.graphics.resize(this.width, this.height);
				*/
			}
			else
			{
				// Canvas should just fill the window at the correct density
				this.graphics.resize(GameWindow.width * GameWindow.pixelRatio, GameWindow.height * GameWindow.pixelRatio);

				// CSS Fill Screen
				this.cssRect.set(0, 0, GameWindow.width, GameWindow.height);
				this.canvas.style.top = "0px";
				this.canvas.style.left = "0px";
				this.canvas.style.width = "100%";
				this.canvas.style.height = "100%";

				// Uniform Content Scaling
				const sx:number = this.graphics.width / this.refWidth;
				const sy:number = this.graphics.height / this.refHeight;
				this.scale = Math.min(sx, sy);
				this.width = this.graphics.width / this.scale;
				this.height = this.graphics.height / this.scale;
			}
		}

		// Begin the input manager's frame - it should handle non-interaction event (mouse moves etc) input here
		this.inputManager.beginFrame();
	}

	//#region Picking
	/**
	 * Runs a hit test down the display list in a front first fashion, returning the top most object at the given coordinates.
	 * @param globalX The global (canvas) x position to test at.
	 * @param globalY The global (canvas) y position to test at.
	 * @param mode The mode to pick with.
	 * @return The hit display object otherwise null.
	 */
	public pick(globalX:number, globalY:number, mode:PickMode):Sprite
	{
		// Init the root transform
		this._pickTransform.set(this.scale, 0, 0, this.scale, 0, 0);		// Our own transform

		// Pick
		return this.root.pick(this._pickTransform, globalX, globalY, mode) || this.root;
	}
	//#endregion

	public render():void
	{
		this.graphics.clear(true);

		this.root.render(this.graphics, this._wvp.set(this.scale, 0, 0, this.scale, 0, 0), 1);
	}

})();
