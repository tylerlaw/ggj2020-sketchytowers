/** @file TeamTowerDefense.ts */

/// <reference path="../defs/AirConsole.d.ts" />
/// <reference path="../framework/Game.ts" />
/// <reference path="../../assets/Assets.generated.ts" />
/// <reference path="controls/ControlPad.ts" />
/// <reference path="controls/LocalControlPad.ts" />
/// <reference path="model/GameState.ts" />

/// <reference path="client/display/DisplayClient.ts" />
/// <reference path="client/player/PlayerClient.ts" />

/// <reference path="screens/MinigameLoggingScreen.ts" />
/// <reference path="screens/MinigameBuildingScreen.ts" />

/// <reference path="screens/TitleScreen.ts" />

class TeamTowerDefense extends Game
{
	public static instance:TeamTowerDefense;

	public readonly isPlayerClient:boolean;
	public readonly isLocalTest:boolean;

	public screenManager:GameScreenManager;

	public titleMusic:Sound;
	public gameMusic:Sound;


	public constructor(isPlayerClient:boolean, isLocalTest:boolean)
	{
		// Configure engine for client type
		if (isPlayerClient)
		{
			// Don't letterbox on clients
			Stage.letterbox = false;
			Stage.dirty = true;
		}

		//Assets.sounds.Arrow_Shot.volume = 0.8;

		// Initialize
		super();
		TeamTowerDefense.instance = this;

		// Initialize Clients
		this.isPlayerClient = isPlayerClient;
		this.isLocalTest = isLocalTest;
	}

	public start():void
	{
		Assets.sounds.Gameplay_Loop.isLooped = true;
		Assets.sounds.Charachter_select_loop.isLooped = true;

		if (this.isLocalTest) new LocalControlPad();

		this.titleMusic = new Sound(Assets.sounds.Charachter_select_loop);
		this.gameMusic = new Sound(Assets.sounds.Gameplay_Loop);

		// Setup screen manager
		this.screenManager = new GameScreenManager();

		// Setup stage
		Stage.root.addChild(this.screenManager.display);

		// Add screen
		//this.screenManager.add(new TitleScreen(this.isPlayerClient, this.isLocalTest));
		if (this.isLocalTest)
		{
			this.screenManager.add(new ScreenGameplayScreen());
			//this.screenManager.add(new MinigameBuildingScreen(0));
			//this.screenManager.add(new MinigameLoggingScreen(0));
			//this.screenManager.add(new PlayerGameplayScreen());
		}
		else
		{
			this.screenManager.add(new TitleScreen(this.isPlayerClient, this.isLocalTest));
		}

		// Start ticking
		super.start();
	}

	protected update(elapsed:number):void
	{
		if (this.isLocalTest)
		{
			(<LocalControlPad>ControlPad.array[0]).poll();
		}
		else
		{
			if (this.isPlayerClient)
			{
				PlayerClient.update();
			}
		}
		
		this.screenManager.update(elapsed);
	}

	protected draw():void
	{
		this.screenManager.draw();
	}
}
