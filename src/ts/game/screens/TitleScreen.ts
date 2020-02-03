/** @file TitleScreen.ts */

/// <reference path="../stage/general/StandardButton.ts" />
/// <reference path="PlayerSelectScreen.ts" />
/// <reference path="LobbyScreen.ts" />

class TitleScreen extends GameScreen
{
	private _logo:Bitmap;
	private _connectingLbl:TextField;
	private _playButton:StandardButton;
	private _gameFullLbl:TextField;


	private readonly _isPlayerClient:boolean;
	private readonly _isLocalTest:boolean;


	public constructor(isPlayerClient:boolean, isLocalTest:boolean)
	{
		super();

		this._isPlayerClient = isPlayerClient;
		this._isLocalTest = isLocalTest;
	}

	protected initialize():void
	{
		this._logo = new Bitmap(Assets.images.Title);
		this.display.addChild(this._logo);

		this._connectingLbl = new TextField("Connecting...", new TextSettings(Assets.fonts.OpenSans_Bold, 20, TextAlign.Center, TextBaseline.Alphabetic), new FillSettings("#FFFFFF"));
		this.display.addChild(this._connectingLbl);

		this._gameFullLbl = new TextField("Game is full. Please Wait.", new TextSettings(Assets.fonts.OpenSans_Bold, 20, TextAlign.Center, TextBaseline.Alphabetic), new FillSettings("#FFFFFF"));
		this.display.addChild(this._gameFullLbl);
		this._gameFullLbl.visible = false;

		this._playButton = new StandardButton(880, 120, "Play!");
		this.display.addChild(this._playButton);
		this._playButton.regX = this._playButton.w / 2;
		this._playButton.regY = this._playButton.h;
		this._playButton.visible = false;

		if (this._isPlayerClient === false)
		{
			DisplayClient.onConnected.add(this.DisplayClient_onConnected, this);
			if (DisplayClient.connectionState !== ConnectionState.Connected)
			{
				DisplayClient.connect();
			}
			else
			{
				this.DisplayClient_onConnected();
			}
		}
		else
		{
			PlayerClient.onConnected.add(this.PlayerClient_onConnected, this);
			if (PlayerClient.connectionState !== ConnectionState.Connected)
			{
				PlayerClient.connect();
			}
			else
			{
				this.PlayerClient_onConnected();
			}
		}

		this._playButton.input.onPointerClick.add(this.playButton_onClick, this);

		this.anchor();

		if (this._isPlayerClient === false)
		{
			TeamTowerDefense.instance.gameMusic.stop();
			TeamTowerDefense.instance.titleMusic.play();
		}

		super.initialize();
	}


	private DisplayClient_onConnected():void
	{
		DisplayClient.onConnected.remove(this.DisplayClient_onConnected, this);

		this._connectingLbl.visible = false;

		DisplayClient.onPlayerJoined.add(this.DisplayClient_onPlayerJoined, this);
		if (DisplayClient.room.numPlayers > 0) this.DisplayClient_onPlayerJoined();
	}

	private DisplayClient_onPlayerJoined():void
	{
		DisplayClient.onPlayerJoined.remove(this.DisplayClient_onPlayerJoined, this);
		this.screenManager.add(new LobbyScreen());
		this.exit();
	}



	private PlayerClient_onConnected():void
	{
		PlayerClient.onConnected.remove(this.PlayerClient_onConnected, this);

		this._connectingLbl.visible = false;

		PlayerClient.onJoinAvailable.add(this.PlayerClient_onJoinAvailable, this);
		PlayerClient.onJoinUnavailable.add(this.PlayerClient_onJoinUnavailable, this);
		PlayerClient.isJoinAvailable();
	}

	private PlayerClient_onJoinAvailable():void
	{
		this._playButton.visible = true;
		this._gameFullLbl.visible = false;
	}

	private PlayerClient_onJoinUnavailable():void
	{
		this._playButton.visible = false;
		this._gameFullLbl.visible = true;
	}

	private playButton_onClick():void
	{
		this._playButton.visible = false;

		PlayerClient.onJoinApproved.add(this.PlayerClient_onJoinApproved, this);
		PlayerClient.onJoinDenied.add(this.PlayerClient_onJoinDenied, this);
		PlayerClient.requestJoin();
	}

	private PlayerClient_onJoinApproved():void
	{
		PlayerClient.onJoinApproved.remove(this.PlayerClient_onJoinApproved, this);
		PlayerClient.onJoinDenied.remove(this.PlayerClient_onJoinDenied, this);

		PlayerClient.onJoinAvailable.remove(this.PlayerClient_onJoinAvailable, this);
		PlayerClient.onJoinUnavailable.remove(this.PlayerClient_onJoinUnavailable, this);

		this.screenManager.add(new PlayerSelectScreen());
		this.exit();
	}

	private PlayerClient_onJoinDenied():void
	{
		PlayerClient.onJoinApproved.remove(this.PlayerClient_onJoinApproved, this);
		PlayerClient.onJoinDenied.remove(this.PlayerClient_onJoinDenied, this);

		PlayerClient.isJoinAvailable();
	}


	private anchor():void
	{
		this._logo.x = Stage.width / 2 - this._logo.texture.width / 2;
		this._logo.y = Stage.height / 2 - this._logo.texture.height / 2;

		this._connectingLbl.x = Stage.width / 2;
		this._connectingLbl.y = Stage.height - 40;

		this._gameFullLbl.x = Stage.width / 2;
		this._gameFullLbl.y = Stage.height - 40;

		this._playButton.x = Stage.width / 2;
		this._playButton.y = Stage.height - 40;
	}

	public update(elapsed:number):void
	{
		this.anchor();

		super.update(elapsed);
	}
}
