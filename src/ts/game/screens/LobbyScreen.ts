/** @file LobbyScreen.ts */

/// <reference path="../stage/lobby/LobbyPlayerBox.ts" />
/// <reference path="ScreenGameplayScreen.ts" />

class LobbyScreen extends GameScreen
{
	private readonly boxes:LobbyPlayerBox[] = [
		new LobbyPlayerBox(0),
		new LobbyPlayerBox(1),
		new LobbyPlayerBox(2),
		new LobbyPlayerBox(3)
	];

	private dimmer:Dimmer;

	private readonly countdownText:TextField = new TextField("3", new TextSettings(Assets.fonts.OpenSans_Bold, 800, TextAlign.Center, TextBaseline.Middle), new FillSettings("#FFFFFF"));

	private countdown:number = 0;

	// need a dimmer and a count text
	// need to mark display client as game started when count hits 0


	public constructor()
	{
		super();
	}

	protected initialize():void
	{
		for (let box of this.boxes) this.display.addChild(box);

		this.dimmer = new Dimmer();
		this.dimmer.visible = false;
		this.display.addChild(this.dimmer);

		this.display.addChild(this.countdownText);
		this.countdownText.visible = false;

		DisplayClient.onPlayerLeft.add(this.DisplayClient_onPlayerLeft, this);
		DisplayClient.onPlayersReady.add(this.DisplayClient_onPlayersReady, this);
		DisplayClient.onPlayersUnready.add(this.DisplayClient_onPlayersUnready, this);

		if (DisplayClient.room.allReady)
		{
			this.DisplayClient_onPlayersReady();
		}

		TeamTowerDefense.instance.gameMusic.stop();
		TeamTowerDefense.instance.titleMusic.play();

		this.anchor();

		super.initialize();
	}

	private DisplayClient_onPlayerLeft():void
	{
		if (DisplayClient.room.numPlayers === 0)
		{
			DisplayClient.onPlayerLeft.remove(this.DisplayClient_onPlayerLeft, this);
			DisplayClient.onPlayersReady.remove(this.DisplayClient_onPlayersReady, this);
			DisplayClient.onPlayersUnready.remove(this.DisplayClient_onPlayersUnready, this);

			this.screenManager.add(new TitleScreen(TeamTowerDefense.instance.isPlayerClient, TeamTowerDefense.instance.isLocalTest));
			this.exit();
		}
	}

	private DisplayClient_onPlayersReady():void
	{
		this.dimmer.visible = true;
		this.countdownText.visible = true;
		this.countdown = 3000;
	}

	private DisplayClient_onPlayersUnready():void
	{
		this.dimmer.visible = false;
		this.countdownText.visible = false;
		this.countdown = 0;
	}

	private anchor():void
	{
		for (let box of this.boxes) box.anchor();

		this.countdownText.x = Stage.width / 2;
		this.countdownText.y = Stage.height / 2;
	}

	public update(elapsed:number):void
	{
		this.anchor();

		if (this.countdown > 0)
		{
			this.countdown -= elapsed;
			if (this.countdown > 0)
			{
				this.countdownText.text = Math.ceil(this.countdown / 1000) + "";
			}
			else
			{
				DisplayClient.startGame();
				this.screenManager.add(new ScreenGameplayScreen());
				this.exit();
			}
		}

		

		super.update(elapsed);
	}
}
