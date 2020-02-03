/** @file ScreenGameplayScreen.ts */

/// <reference path="../stage/map/Map.ts" />
/// <reference path="GameOverScreen.ts" />

class ScreenGameplayScreen extends GameScreen
{
	public map:Map;

	public killCount:TextField = new TextField("TIME: 0", new TextSettings(Assets.fonts.OpenSans_Bold, 40, TextAlign.Left, TextBaseline.Alphabetic), new FillSettings("#000000"), new StrokeSettings("#FFFFFF", 8, true));

	public time:number = 0;

	public constructor()
	{
		super();
	}

	protected initialize():void
	{
		this.map = new Map();
		this.display.addChild(this.map);

		DisplayClient.onTreeFinished.add(this.DisplayClient_onTreeFinished, this);
		DisplayClient.onBuildingFinished.add(this.DisplayClient_onBuildingFinished, this);

		this.display.addChild(this.killCount);

		this.anchor();

		console.log("stopping music");
		TeamTowerDefense.instance.titleMusic.stop();
		TeamTowerDefense.instance.gameMusic.play();

		super.initialize();
	}

	protected removed():void
	{
		DisplayClient.onTreeFinished.remove(this.DisplayClient_onTreeFinished, this);
		DisplayClient.onBuildingFinished.remove(this.DisplayClient_onBuildingFinished, this);

		super.removed();
	}


	private DisplayClient_onTreeFinished(treeSprite:TreeSprite):void
	{
		this.map.removeTree(treeSprite);
	}

	private DisplayClient_onBuildingFinished(tower:TowerSprite):void
	{
		//this.map.removeTree(tower);
	}


	private anchor():void
	{
		this.killCount.x = 20;
		this.killCount.y = Stage.height - 20;
	}

	public update(elapsed:number):void
	{
		this.anchor();


		if (this.isFocused)
		{
			this.time += elapsed;
			this.killCount.text = "TIME: " + Math.floor(this.time / 1000);

			this.map.update(elapsed);

			let go:boolean = true;
			for (let tower of this.map.towerSprites)
			{
				if (!tower.isDestroyed)
				{
					go = false;
				}
			}
			if (go)
			{
				let gameOver:GameOverScreen = new GameOverScreen();
				gameOver.onRemoved.add(this.gameOver_onRemoved, this);
				this.screenManager.add(gameOver);

				DisplayClient.triggerGameOver();
			}
		}

		super.update(elapsed);
	}


	private gameOver_onRemoved():void
	{
		this.screenManager.add(new LobbyScreen());
		this.exit();
	}
}
