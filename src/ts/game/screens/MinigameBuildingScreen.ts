/** @file MinigameBuildingScreen.ts */

class MinigameBuildingFillBar extends Sprite
{
	public health:number = 0;

	public fill:FillSettings = new FillSettings("#00FF00");

	public constructor()
	{
		super();
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		ctx.drawRect(matrix, alpha, 0, Stage.height * 0.975, Stage.width * this.health / 100, Stage.height, this.fill);

		super.render(ctx, matrix, alpha);
	}
}

class MinigameBuildingBg extends Sprite
{
	public fill:FillSettings = new FillSettings("#FFFFFF");

	public constructor()
	{
		super();
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		ctx.drawRect(matrix, alpha, 0, 0, Stage.width, Stage.height, this.fill);

		super.render(ctx, matrix, alpha);
	}
}

class MinigameBuildingNail extends Bitmap
{
	public downTexture:Texture = Assets.images.nail_down;
	public upTexture:Texture = Assets.images.nail_up;

	public isUp:boolean = false;

	public hitArea:Rectangle = new Rectangle(-60 + 70, -92 + 97, 120, 76);

	public life:number = 0;


	public constructor()
	{
		super(Assets.images.nail_down);
		this.regX = this.texture.width / 2;
		this.regY = 97;

		this.input = new DisplayInputComponent(this, true, false, this.hitArea);
	}

	public up(life:number):void
	{
		this.isUp = true;
		this.texture = this.upTexture;
		this.life = life;
	}

	public down():void
	{
		this.isUp = false;
		this.texture = this.downTexture;
	}
}

class MinigameBuildingScreen extends GameScreen
{
	//public hammer:Bitmap = new Bitmap(Assets.images.hammer);
	public backBtn:Button = new Button();
	public backBtnBitmap:Bitmap = new Bitmap(Assets.images.back_button);
	public fillBar:MinigameBuildingFillBar = new MinigameBuildingFillBar();
	public nails:MinigameBuildingNail[] = [];
	public bg:MinigameBuildingBg = new MinigameBuildingBg();

	private readonly upNails:MinigameBuildingNail[] = [];

	private nextDelay:number = 1500;

	//private hammerPause:number = 0;
	//private hammerTween:


	public constructor(health:number)
	{
		super();
		this.fillBar.health = health;
	}

	protected initialize():void
	{
		this.display.addChild(this.bg);

		//this.hammer.regX = this.hammer.texture.width / 2;
		//this.hammer.regY = 254;
		//this.display.addChild(this.hammer);

		this.display.addChild(this.fillBar);

		this.backBtn.addChild(this.backBtnBitmap);
		this.display.addChild(this.backBtn);
		this.backBtn.x = this.backBtn.y = 20;
		this.backBtn.input.hitArea = new Circle(0, 0, Math.max(this.backBtnBitmap.texture.width, this.backBtnBitmap.texture.height));

		this.backBtn.input.onPointerClick.add(this.backBtn_onPress, this);

		for (let i:int = 0; i < 6; i++)
		{
			let nail:MinigameBuildingNail = new MinigameBuildingNail();
			this.nails.push(nail);
			this.display.addChild(this.nails[this.nails.length - 1]);
			//nail.input.onPointerPress.add(this.nail_press, this);
		}

		for (let pointer of PointerInput.pointers)
		{
			pointer.onPress.add(this.pointer_onPress, this);
		}

		//this.nails[0].up(1000);
		//this.nails[this.nails.length - 1].up(1500);

		this.anchor();

		navigator.vibrate([500, 50, 100, 50, 50]);

		PlayerClient.onBuildingHealthChange.add(this.PlayerClient_onBuildingHealthChange, this);
		PlayerClient.onBuildingFinished.add(this.PlayerClient_onBuildingFinished, this);
		PlayerClient.onExitMinigame.add(this.PlayerClient_onExitMinigame, this);
		//PlayerClient.onGameOver.add(this.PlayerClient_onGameOver, this);

		super.initialize();
	}

	protected removed():void
	{
		PlayerClient.onBuildingHealthChange.remove(this.PlayerClient_onBuildingHealthChange, this);
		PlayerClient.onBuildingFinished.remove(this.PlayerClient_onBuildingFinished, this);
		PlayerClient.onExitMinigame.remove(this.PlayerClient_onExitMinigame, this);
		//PlayerClient.onGameOver.remove(this.PlayerClient_onGameOver, this);
	}

	private pointer_onPress(pointer:Pointer):void
	{
		for (let nail of this.nails)
		{
			if (nail.isUp)
			{
				let local:Vector2 = nail.globalToLocal(new Vector2(pointer.x, pointer.y));
				if (nail.hitArea.containsVector(local))
				{
					nail.down();
					PlayerClient.hitNail();
					new Sound(Assets.sounds.Repair_Hammer_on_Nail).play();
					navigator.vibrate([20]);
				}
			}
		}
	}


	private backBtn_onPress():void
	{
		PlayerClient.requestExitMinigame();
	}

	private PlayerClient_onBuildingHealthChange(health:number):void
	{
		this.fillBar.health = health;
	}

	private PlayerClient_onBuildingFinished():void
	{
		this.exit();
	}

	private PlayerClient_onExitMinigame():void
	{
		this.exit();
	}



	private anchor():void
	{
		let nailSize:number = Math.min(Stage.width * 0.15);
		let ttlNailSizeX:number = nailSize * 3;
		let ttlNailSizeY:number = nailSize * 2;
		let nailScale:number = nailSize / 140;
		let ttlPadX:number = Stage.width - ttlNailSizeX;
		let padX:number = ttlPadX / 4;
		let ttlPadY:number = Stage.height - ttlNailSizeY;
		let padY:number = ttlPadY / 3;

		for (let r:int = 0; r < 2; ++r)		{
			for (let c:int = 0; c < 3; ++c)
			{
				let i:int = r * 3 + c;
				let nail:MinigameBuildingNail = this.nails[i];
				nail.scaleX = nail.scaleY = nailScale;
				nail.x = Stage.width / 4 * (c + 1);
				nail.y = Stage.height / 3 * (r + 1);

				/*
				nail.x = padX * (c + 1) + nailSize * c;
				nail.y = padY * (r + 1) + nailSize * r;
				nail.scaleX = nail.scaleY = nailScale;
				if (i === 0)
				{
					console.log(nail.x + nail.regX, nail.y + 97);
				}
				*/
			}
		}

		//this.hammer.scaleX = this.hammer.scaleY = nailScale;

	}

	public update(elapsed:number):void
	{
		for (let i:int = 0; i < this.upNails.length; ++i)
		{
			let nail:MinigameBuildingNail = this.upNails[i];
			nail.life -= elapsed;
			if (nail.life <= 0)
			{
				nail.down();
				this.upNails.splice(i, 1);
				i--;
			}
		}

		if (this.upNails.length === 0)
		{
			if (this.nextDelay <= 0)
			{
				this.nextDelay = Math.random() * 900 + 100;
			}
		}

		if (this.nextDelay > 0)
		{
			this.nextDelay -= elapsed;
			if (this.nextDelay <= 0)
			{
				let numNails:number = Math.floor(Math.random() * 2) + 1;
				//numNails = 1;
				while (numNails > 0)
				{
					let nail:MinigameBuildingNail = this.nails[Math.floor(Math.random() * this.nails.length)];
					nail.up(Math.random() * 750 + 250);
					this.upNails.push(nail);

					numNails--;
				}
			}
		}

		this.anchor();

		super.update(elapsed);
	}
}
