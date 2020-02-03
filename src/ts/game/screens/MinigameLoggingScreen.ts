/** @file MinigameLoggingScreen.ts */

class MinigameLoggingSwipe extends Sprite
{
	public screen:MinigameLoggingScreen;

	public isFinished:boolean = false;
	public isDead:boolean = false;
	public isSuccess:boolean = false;

	private readonly _tween:Interpolator = new Interpolator(1, 0, 150, 0);

	private readonly normalStroke:StrokeSettings = new StrokeSettings("#CCCCCC", 3);
	private readonly successStroke:StrokeSettings = new StrokeSettings("#FFFFFF", 6);
	private readonly failedStroke:StrokeSettings = new StrokeSettings("#FF0000", 3);

	public start:Vector2 = new Vector2();
	public end:Vector2 = new Vector2();

	public constructor(screen:MinigameLoggingScreen)
	{
		super();
		this.screen = screen;
	}

	public update(elapsed:number):void
	{
		if (this.isFinished)
		{
			this.alpha = this._tween.update(elapsed);
			if (this._tween.isFinished) this.isFinished = true;
		}
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.isSuccess)
		{
			ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.successStroke);
		}
		else if (this.isFinished)
		{
			ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.failedStroke);
		}
		else
		{
			ctx.drawLine(matrix, alpha, this.start.x, this.start.y, this.end.x, this.end.y, this.normalStroke);
		}

		super.render(ctx, matrix, alpha);
	}
}

class MinigameLoggingFillBar extends Sprite
{
	public health:number = 100;

	public fill:FillSettings = new FillSettings("#00FF00");

	public constructor()
	{
		super();
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		ctx.drawRect(matrix, alpha, 0, Stage.height * 0.975, Stage.width * (100 - this.health) / 100, Stage.height, this.fill);

		super.render(ctx, matrix, alpha);
	}
}

class MinigameLoggingScreen extends GameScreen
{
	public logBmp:Bitmap = new Bitmap(Assets.images.log);
	public backBtn:Button = new Button();
	public backBtnBitmap:Bitmap = new Bitmap(Assets.images.back_button);
	public fillBar:MinigameLoggingFillBar = new MinigameLoggingFillBar();

	public readonly hitRect:Rectangle = new Rectangle();

	private isPressed:boolean = false;
	private _crossed:boolean = false;
	private readonly _downLoc:Vector2 = new Vector2();
	private readonly _curLoc:Vector2 = new Vector2();

	private _swipe:MinigameLoggingSwipe = null;
	private readonly _swipes:MinigameLoggingSwipe[] = [];

	private isReverse:boolean = false;

	private _forceKillDelay:number = -1;

	public sounds:Sound[] = [
		new Sound(Assets.sounds.Log_Chopping_1),
		new Sound(Assets.sounds.Log_Chopping_2),
		new Sound(Assets.sounds.Log_Chopping_3)
	];
	public soundIndex:int = 0;


	// TODO:
	// particle effect on chop
	// if player dies while in minigame, the minigame quits
	// show hit overlay if player gets hit while in minigame
	// player can quit minigame
	// display a fill bar

	public constructor(health:number)
	{
		super();
		this.fillBar.health = health;
	}

	protected initialize():void
	{

		this.logBmp.regX = this.logBmp.texture.width / 2;
		this.logBmp.regY = this.logBmp.texture.height / 2;
		this.display.addChild(this.logBmp);

		this.display.addChild(this.fillBar);

		this.backBtn.addChild(this.backBtnBitmap);
		this.display.addChild(this.backBtn);
		this.backBtn.x = this.backBtn.y = 20;
		this.backBtn.input.hitArea = new Circle(0, 0, Math.max(this.backBtnBitmap.texture.width, this.backBtnBitmap.texture.height));


		this.display.input = new DisplayInputComponent(this.display, true, false, this.hitRect);

		this.display.input.onPointerPress.add(this.display_onPress, this);
		this.display.input.onPointerRelease.add(this.display_onRelease, this);
		this.display.input.onPointerCancel.add(this.display_onRelease, this);
		this.display.input.onPointerOut.add(this.display_onRelease, this);

		PlayerClient.onTreeHealthChange.add(this.PlayerClient_onTreeHealthChange, this);
		PlayerClient.onTreeFinished.add(this.PlayerClient_onTreeFinished, this);
		PlayerClient.onExitMinigame.add(this.PlayerClient_onExitMinigame, this);

		this.backBtn.input.onPointerClick.add(this.backBtn_onPress, this);

		this.anchor();

		navigator.vibrate([500, 50, 100, 50, 50]);

		super.initialize();
	}

	protected removed():void
	{
		PlayerClient.onTreeHealthChange.remove(this.PlayerClient_onTreeHealthChange, this);
		PlayerClient.onTreeFinished.remove(this.PlayerClient_onTreeFinished, this);
		PlayerClient.onExitMinigame.remove(this.PlayerClient_onExitMinigame, this);
	}


	private backBtn_onPress():void
	{
		PlayerClient.requestExitMinigame();
	}

	private PlayerClient_onTreeHealthChange(health:number):void
	{
		this.fillBar.health = health;
	}

	private PlayerClient_onTreeFinished():void
	{
		this.exit();
	}

	private PlayerClient_onExitMinigame():void
	{
		this.exit();
	}


	private display_onPress():void
	{
		this._crossed = false;
		let xNow:number = PointerInput.primary.x / Stage.scale;
		let yNow:number = PointerInput.primary.y / Stage.scale;
		

		this.isPressed = true;
		this._downLoc.set(xNow, yNow);
		this._swipe = new MinigameLoggingSwipe(this);
		this.display.addChild(this._swipe);
		this._swipe.start.set(xNow, yNow);
		this._swipe.end.set(xNow, yNow);
		this._swipes.push(this._swipe);
		this._forceKillDelay = -1;

		if (xNow < Stage.width / 2)
		{
			this.isReverse = false;
		}
		else
		{
			this.isReverse = true;
		}
	}

	private display_onRelease():void
	{
		if (this.isPressed)
		{
			let xNow:number = PointerInput.primary.x / Stage.scale;
			let yNow:number = PointerInput.primary.y / Stage.scale;
			this._swipe.end.set(xNow, yNow);
			this._swipe.isFinished = true;
			this.isPressed = false;
			if ((this.isReverse === false && xNow > Stage.width / 2) || (this.isReverse && xNow < Stage.width / 2))
			{
				// chopped
			}
			else
			{
				// Play failed sound effect
				// show missed?
			}
			
		}
	}




	private anchor():void
	{
		this.hitRect.set(0, 0, Stage.width, Stage.height);

		this.logBmp.x = Stage.width / 2;
		this.logBmp.y = Stage.height / 2;

		this.logBmp.scaleX = this.logBmp.scaleY = Stage.height * 0.8 / this.logBmp.texture.height;
	}

	public update(elapsed:number):void
	{
		for (let i:int = 0; i < this._swipes.length; ++i)
		{
			this._swipes[i].update(elapsed);
			if (this._swipes[i].isDead)
			{
				this._swipes.splice(i, 1);
				i--;
			}

		}

		if (this.isPressed)
		{
			let prevX:number = this._curLoc.x;
			let prevY:number = this._curLoc.y;
			let xNow:number = PointerInput.primary.x / Stage.scale;
			let yNow:number = PointerInput.primary.y / Stage.scale;
			this._swipe.end.set(xNow, yNow);
			this._curLoc.set(xNow, yNow);
			if (!this._crossed)
			{
				if ((this.isReverse === false && xNow > Stage.width / 2) || (this.isReverse && xNow < Stage.width / 2))
				{
					PlayerClient.choppedLog();
					this._crossed = true;
					this._swipe.isSuccess = true;
					// Play chop sound
					// Particle effect
					this._forceKillDelay = 100;

					if (navigator.vibrate)
						navigator.vibrate([20]);

					this.sounds[this.soundIndex].stop();
					this.sounds[this.soundIndex].play();
					this.soundIndex++;
					if (this.soundIndex >= this.sounds.length) this.soundIndex = 0;
				}
			}
			else
			{
				if ((this.isReverse === false && xNow < Stage.width / 2) || (this.isReverse && xNow > Stage.width / 2))
				{
					this.display_onRelease();
					this._swipe.end.set(prevX, prevY);
					this._curLoc.set(prevX, prevY);
				}
			}
		}

		if (this.isPressed && this._forceKillDelay > 0)
		{
			this._forceKillDelay -= elapsed;
			if (this._forceKillDelay <= 0)
			{
				this.display_onRelease();
			}
		}
	
		super.update(elapsed);
	}
}
