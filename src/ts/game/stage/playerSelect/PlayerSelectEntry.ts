/** @file PlayerSelectEntry.ts */

/// <reference path="../general/PlayerStatBar.ts" />

class PlayerSelectEntry extends Sprite
{
	private readonly bgFill:FillSettings;

	public readonly index:int;
	public readonly job:PlayerJob;
	public readonly color:PlayerColor;

	private readonly _playerSprite:PlayerSprite;

	private readonly _infoBox:Sprite = new Sprite();
	private readonly _nameTextField:TextField = new TextField("", new TextSettings(Assets.fonts.OpenSans_Bold, 80, TextAlign.Left, TextBaseline.Top), new FillSettings("#FFFFFF"));
	private readonly _atkBmp:Bitmap = new Bitmap(Assets.images.icon_attack);
	private readonly _defBmp:Bitmap = new Bitmap(Assets.images.icon_defense);
	private readonly _spdBmp:Bitmap = new Bitmap(Assets.images.icon_speed);
	private readonly _bldBmp:Bitmap = new Bitmap(Assets.images.icon_build);
	private readonly _atkBar:PlayerStatBar = new PlayerStatBar();
	private readonly _defBar:PlayerStatBar = new PlayerStatBar();
	private readonly _spdBar:PlayerStatBar = new PlayerStatBar();
	private readonly _bldBar:PlayerStatBar = new PlayerStatBar();


	public constructor(index:int, job:PlayerJob, color:PlayerColor)
	{
		super();

		this.index = index;
		this.job = job;
		this.color = color;

		this.bgFill = new FillSettings(this.color.main);

		this._playerSprite = new job.spriteClass(this.color.index, null);
		this.addChild(this._playerSprite);

		this._atkBmp.scaleX = this._atkBmp.scaleY =
		this._defBmp.scaleX = this._defBmp.scaleY =
		this._spdBmp.scaleX = this._spdBmp.scaleY =
		this._bldBmp.scaleX = this._bldBmp.scaleY = 0.3;

		this._nameTextField.text = job.name.toUpperCase();

		this._infoBox.addChild(this._nameTextField);
		this._infoBox.addChild(this._atkBmp);
		this._infoBox.addChild(this._defBmp);
		this._infoBox.addChild(this._spdBmp);
		this._infoBox.addChild(this._bldBmp);
		this.addChild(this._infoBox);

		this._infoBox.addChild(this._atkBar);
		this._infoBox.addChild(this._defBar);
		this._infoBox.addChild(this._spdBar);
		this._infoBox.addChild(this._bldBar);

		this._atkBar.y = this._atkBmp.y = 128;
		this._defBar.y = this._defBmp.y = 128 + 90;
		this._spdBar.y = this._spdBmp.y = 128 + 90 * 2;
		this._bldBar.y = this._bldBmp.y = 128 + 90 * 3;

		this._atkBar.x = this._defBar.x = this._spdBar.x = this._bldBar.x = 100;

		this._atkBar.count = this.job.attack;
		this._defBar.count = this.job.defense;
		this._spdBar.count = this.job.speed;
		this._bldBar.count = this.job.build;
	}

	public anchor():void
	{
		this.x = Stage.width * this.index;

		let desSize:number = 0.42 * Stage.width;
		this._playerSprite.scaleX = this._playerSprite.scaleY = desSize / PlayerSprite.WIDTH;
		this._playerSprite.x = Stage.width / 4;
		this._playerSprite.y = Stage.height / 2 + desSize / 2;

		this._infoBox.x = Stage.width / 2 + 40;
		this._infoBox.y = Stage.height / 2 - 488 / 2;
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		ctx.drawRect(matrix, alpha, 0, 0, Stage.width + 2, Stage.height, new FillSettings("#222222"));

		ctx.drawRect(matrix, alpha, 0, 0, Stage.width + 2, 40, this.bgFill);
		ctx.drawRect(matrix, alpha, 0, Stage.height - 40, Stage.width + 2, 40, this.bgFill);

		super.render(ctx, matrix, alpha);
	}
}
