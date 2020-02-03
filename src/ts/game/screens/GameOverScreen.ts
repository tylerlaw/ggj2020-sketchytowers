/** @file GameOverScreen.ts */

class GameOverScreen extends GameScreen
{
	public delay:number = 5000;

	public dimmer:Dimmer = new Dimmer();
	public lbl:TextField = new TextField(
		"GAME OVER",
		new TextSettings(Assets.fonts.OpenSans_Bold, 200, TextAlign.Center, TextBaseline.Middle),
		new FillSettings("#FFFFFF"),
		new StrokeSettings("#000000", 20, true)
	);

	public constructor()
	{
		super();
		this.isPopup = true;
	}

	protected initialize():void
	{
		this.display.addChild(this.dimmer);
		this.display.addChild(this.lbl);

		this.anchor();

		if (TeamTowerDefense.instance.isPlayerClient === false)
		{
			TeamTowerDefense.instance.gameMusic.stop();
			TeamTowerDefense.instance.titleMusic.play();
		}

		super.initialize();
	}

	public anchor():void
	{
		this.lbl.x = Stage.width / 2;
		this.lbl.y = Stage.height / 2;
	}


	public update(elapsed:number):void
	{
		this.anchor();

		this.delay -= elapsed;

		if (this.delay <= 0)
		{
			this.exit();
		}
	}
}
