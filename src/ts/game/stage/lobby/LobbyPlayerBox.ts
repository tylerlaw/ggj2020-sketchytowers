/** @file LobbyPlayerBox.ts */

class LobbyPlayerBox extends Sprite
{
	//#region Display
	private readonly _emptyFill:FillSettings = new FillSettings("#222222");

	private readonly _numberFill:FillSettings = new FillSettings("#000000");
	private readonly _numberStroke:StrokeSettings = new StrokeSettings("#FFFFFF", 2);
	private readonly _numberAlpha:number = 0.1;
	private readonly _numberFont:TextSettings = new TextSettings(Assets.fonts.OpenSans_Bold, 600, TextAlign.Center, TextBaseline.Middle);

	private readonly _joinNowFill:FillSettings = new FillSettings("#666666");
	private readonly _joinNowFont:TextSettings = new TextSettings(Assets.fonts.OpenSans_Bold, 40, TextAlign.Center, TextBaseline.Middle);

	private readonly _joinedFill:FillSettings;

	private readonly _readyFill:FillSettings = new FillSettings("#FFFFFF");
	private readonly _readyFont:TextSettings = new TextSettings(Assets.fonts.OpenSans_Bold, 80, TextAlign.Center, TextBaseline.Middle);

	private _playerSprite:PlayerSprite = null;
	//#endegion


	//#region Members
	public readonly index:int;

	public isPresent:boolean = false;

	public isReady:boolean = false;
	//#endregion


	public constructor(index:int)
	{
		super();
		this.index = index;

		this.x = Stage.refWidth / 4 * index;
		this._joinedFill = new FillSettings(PlayerColors.array[index].main);

		DisplayClient.onPlayerJoined.add(this.DisplayClient_onPlayerJoined, this);
		DisplayClient.onPlayerLeft.add(this.DisplayClient_onPlayerLeft, this);
		DisplayClient.onPlayerJobChange.add(this.DisplayClient_onPlayerJobChange, this);
		DisplayClient.onPlayerReady.add(this.DisplayClient_onPlayerReady, this);
		DisplayClient.onPlayerNotReady.add(this.DisplayClient_onPlayerNotReady, this);

		// Mark as joined if alread in game
		let playerSlot:PlayerSlot = DisplayClient.room.playerSlots[index];
		if (playerSlot && playerSlot.isPresent)
		{
			this.DisplayClient_onPlayerJoined(playerSlot.index);
			if (playerSlot.isReady)
			{
				this.DisplayClient_onPlayerReady(playerSlot.index);
			}
		}
	}

	public dispose():void
	{

	}


	private DisplayClient_onPlayerReady(playerIndex:number):void
	{
		if (playerIndex !== this.index) return;

		this.isReady = true;
	}

	private DisplayClient_onPlayerNotReady(playerIndex:number):void
	{
		if (playerIndex !== this.index) return;

		this.isReady = false;
	}

	private DisplayClient_onPlayerJobChange(playerIndex:number, jobIndex:number):void
	{
		if (playerIndex !== this.index) return;

		if (this._playerSprite)
		{
			this.removeChild(this._playerSprite);
			this._playerSprite = null;
		}

		let playerSlot:PlayerSlot = DisplayClient.room.playerSlots[this.index];

		this._playerSprite = new playerSlot.job.spriteClass(PlayerColors.array[this.index].index, null);
		this.addChild(this._playerSprite);
	}

	private DisplayClient_onPlayerJoined(playerIndex:number):void
	{
		if (playerIndex !== this.index) return;

		this.isPresent = true;
		this.isReady = false;

		let playerSlot:PlayerSlot = DisplayClient.room.playerSlots[this.index];

		this._playerSprite = new playerSlot.job.spriteClass(PlayerColors.array[this.index].index, null);
		this.addChild(this._playerSprite);
	}

	private DisplayClient_onPlayerLeft(playerIndex:number):void
	{
		if (playerIndex !== this.index) return;

		this.isPresent = false;
		this.isReady = false;

		this.removeChild(this._playerSprite);
	}


	public anchor():void
	{
		if (this._playerSprite)
		{
			this._playerSprite.x = Stage.width / 8;
			this._playerSprite.y = Stage.height / 2;

			let desWidth:number = Stage.width / 4 - 40;
			this._playerSprite.scaleX = this._playerSprite.scaleY = desWidth / PlayerSprite.WIDTH;
		}
	}


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (!this.isPresent)
		{
			ctx.drawRect(matrix, alpha, 2, 0, Stage.refWidth / 4 - 4, Stage.refHeight, this._emptyFill);
			ctx.drawText(matrix, alpha * this._numberAlpha, Stage.refWidth / 8, Stage.refHeight / 2, (this.index + 1).toString(), this._numberFont, this._numberFill, this._numberStroke);
			ctx.drawText(matrix, alpha, Stage.refWidth / 8, Stage.refHeight / 2, "Join Now!", this._joinNowFont, this._joinNowFill, null);
		}
		else
		{
			ctx.drawRect(matrix, alpha, 0, 0, Stage.refWidth / 4 + 2, Stage.refHeight, this._joinedFill);
		}

		super.render(ctx, matrix, alpha);

		if (this.isPresent && this.isReady)
		{
			if (this.isReady)
			{
				ctx.drawText(matrix, alpha, Stage.refWidth / 8, Stage.refHeight * 0.8, "Ready!", this._readyFont, this._readyFill, null);
			}
		}
	}

}
