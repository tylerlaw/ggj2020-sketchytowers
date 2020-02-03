/** @file PlayerClient.ts */

/// <reference path="../support/ConnectionState.ts" />
/// <reference path="../support/ClientMessageType.ts" />

class $PlayerClient
{
	public readonly onConnected:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onJoinAvailable:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onJoinUnavailable:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onJoinApproved:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onJoinDenied:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onLeaveApproved:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onLeaveDenied:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onNotReadyApproved:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onStartGame:DelegateEvent<Handler> = new DelegateEvent();

	public readonly onEnterLoggingMinigame:DelegateEvent<{ (treeHealth:int):void; }> = new DelegateEvent();
	public readonly onTreeHealthChange:DelegateEvent<{ (treeHealth:int):void; }> = new DelegateEvent();
	public readonly onTreeFinished:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onExitMinigame:DelegateEvent<Handler> = new DelegateEvent();

	public readonly onEnterBuildingMinigame:DelegateEvent<{ (buildingHealth:int):void; }> = new DelegateEvent();
	public readonly onBuildingHealthChange:DelegateEvent<{ (buildingHealth:int):void; }> = new DelegateEvent();
	public readonly onBuildingFinished:DelegateEvent<Handler> = new DelegateEvent();

	//public readonly onGameOver:DelegateEvent<Handler> = new DelegateEvent();


	private _ac:AirConsole;

	public get connectionState():ConnectionState { return this._connectionState; }
	private _connectionState:ConnectionState = ConnectionState.Disconnected;

	private _requestingIsJoinAvailable:boolean = false;
	private _requestingJoin:boolean = false;
	private _requestingLeave:boolean = false;

	public playerSlot:PlayerSlot = null;

	private _requestingExitMinigame:boolean = false;

	//private readonly _dir:Vector2 = new Vector2(0, 0);
	private degs:number = 0;
	private _dirChanged:boolean = false;
	private _lastDirUpdate:number = 0;
	private readonly _minDirUpdateTime:number = 1000 / 12;
	private _attack:boolean = false;
	private _interact:boolean = false;
	private _build:boolean = false;
	private _move:boolean = false;


	public constructor()
	{
		this.ac_onReady = this.ac_onReady.bind(this);
		this.ac_onConnect = this.ac_onConnect.bind(this);
		this.ac_onDeviceStateChange = this.ac_onDeviceStateChange.bind(this);
		this.ac_onDisconnect = this.ac_onDisconnect.bind(this);
		this.ac_onMessage = this.ac_onMessage.bind(this);
	}


	public connect():void
	{
		if (this._connectionState === ConnectionState.Connected) throw new Error("Already connected");
		else if (this._connectionState === ConnectionState.Connecting) return;

		this._connectionState = ConnectionState.Connecting;

		if (!this._ac) this._ac = new AirConsole({ orientation: AirConsole.ORIENTATION_LANDSCAPE });
		this._ac.onReady = this.ac_onReady;
		this._ac.onConnect = this.ac_onConnect;
		this._ac.onDisconnect = this.ac_onDisconnect;
		this._ac.onDeviceStateChange = this.ac_onDeviceStateChange;
		this._ac.onMessage = this.ac_onMessage;
	}

	public isJoinAvailable():void
	{
		if (this._requestingIsJoinAvailable) return;

		this._requestingIsJoinAvailable = true;
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.IsJoinAvailable });
	}

	public requestJoin():void
	{
		if (this._requestingJoin) return;

		this._requestingJoin = true;
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.RequestJoin });
	}

	public requestLeave():void
	{
		if (this._requestingLeave) return;

		this._requestingLeave = true;
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.RequestLeave });
	}

	public changeJob(job:PlayerJob):void
	{
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.RequestChangeJob, jobIndex: job.index });
	}

	public ready():void
	{
		this.playerSlot.isReady = true;
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.Ready });
	}

	public requestNotReady():void
	{
		this._ac.message(AirConsole.SCREEN, { type: ClientMessageType.RequestNotReady });
	}


	public controlsChanged(attack:boolean, interact:boolean, build:boolean, move:boolean, force?:boolean):void
	{
		if (this._attack !== attack || this._interact !== interact || this._build !== build || this._move !== move || force)
		{
			console.log("sending controls changed");
			this._attack = attack;
			this._interact = interact;
			this._build = build;
			this._move = move;
			this._dirChanged = false;
			if (!move)
			{
				//this._dir.set(0, 0);
				this.degs = 0;
			}
			this._ac.message(AirConsole.SCREEN, {
				type: ClientMessageType.ControlsChanged,
				//x: this._dir.x,
				//y: this._dir.y,
				degs: this.degs,
				move: move,
				attack: attack,
				interact: interact,
				build: build
			});
		}
	}

	public dirChange(degs:number, move:boolean):void //x:number, y:number):void
	{
		//if (x !== this._dir.x || y !== this._dir.y)
		if (degs !== this.degs || move !== this._move)
		{
			this._dirChanged = true;
			//this._dir.set(x, y);
			this.degs = degs;
			this._move = move;
			let now:number = Date.now();
			if (this._dirChanged && now - this._lastDirUpdate >= this._minDirUpdateTime)
			{
				this._lastDirUpdate = now;
				this.controlsChanged(this._attack, this._interact, this._build, this._move, true);
			}
		}
	}


	public requestExitMinigame():void
	{
		if (TeamTowerDefense.instance.isLocalTest)
		{
			this.onExitMinigame.invoke();
		}
		else
		{
			if (this._requestingExitMinigame)
			{
				return;
			}
			this._requestingExitMinigame = true;
			this._ac.message(AirConsole.SCREEN, {
				type: ClientMessageType.RequestExitMinigame
			});
		}
	}







	public update():void
	{
		let now:number = Date.now();
		if (this._dirChanged && now - this._lastDirUpdate >= this._minDirUpdateTime)
		{
			this._lastDirUpdate = now;
			this.controlsChanged(this._attack, this._interact, this._build, this._move, true);
		}
	}



	// HACKS
	private _treeHealth:number = 100;
	private _buildingHealth:number = 0;

	public choppedLog():void
	{
		if (TeamTowerDefense.instance.isLocalTest)
		{
			this._treeHealth -= 10;
			if (this._treeHealth < 0) this._treeHealth = 0;
			this.onTreeHealthChange.invoke(this._treeHealth);
			if (this._treeHealth <= 0)
			{
				this.onTreeFinished.invoke();
			}
		}
		else
		{
			this._ac.message(AirConsole.SCREEN,
			{
				type: ClientMessageType.ChoppedLog
			});
		}
	}

	public hitNail():void
	{
		if (TeamTowerDefense.instance.isLocalTest)
		{
			this._buildingHealth += 100;
			if (this._buildingHealth > 100) this._buildingHealth = 100;
			this.onBuildingHealthChange.invoke(this._buildingHealth);
			if (this._buildingHealth >= 100)
			{
				this.onBuildingFinished.invoke();
			}
		}
		else
		{
			this._ac.message(AirConsole.SCREEN,
			{
				type: ClientMessageType.HitNail
			});
		}
	}



	private ac_onReady(code:string):void
	{
		
	}

	private ac_onConnect(deviceId:number):void
	{
		if (deviceId === 0)
		{
			// There seems to be a bug where you can't immediately send a request to the screen (sometimes), so add a small delay
			this._connectionState = ConnectionState.Connected;
			setTimeout(function():void
			{
				PlayerClient.onConnected.invoke();
			}, 100);
		}
	}

	private ac_onDisconnect(deviceId:number):void
	{
		//console.log("client " + this._ac.getDeviceId() + " onDisonnect", deviceId);
	}

	private ac_onDeviceStateChange(deviceId:number, userData:any):void
	{
		//console.log("client " + this._ac.getDeviceId() + " onDeviceStateChange", deviceId, userData);
	}

	

	private ac_onMessage(deviceId:number, data:any):void
	{
		if (deviceId !== AirConsole.SCREEN) return;
		console.log("client " + this._ac.getDeviceId() + " onMessage", deviceId, data);

		if (data.type === ClientMessageType.JoinAvailable)
		{
			this._requestingIsJoinAvailable = false;
			this.onJoinAvailable.invoke();
		}
		else if (data.type === ClientMessageType.JoinUnavailable)
		{
			this._requestingIsJoinAvailable = false;
			this.onJoinUnavailable.invoke();
		}
		else if (data.type === ClientMessageType.JoinApproved)
		{
			this._requestingJoin = false;
			this.playerSlot = new PlayerSlot(data.playerIndex);
			this.playerSlot.join(this._ac.getDeviceId());
			this.playerSlot.job = PlayerJobs.array[data.jobIndex];
			this.playerSlot.color = PlayerColors.array[data.playerIndex];
			this.onJoinApproved.invoke();
		}
		else if (data.type === ClientMessageType.JoinDenied)
		{
			this._requestingJoin = false;
			this.onJoinDenied.invoke();
		}
		else if (data.type === ClientMessageType.LeaveApproved)
		{
			this._requestingLeave = false;
			this.playerSlot.leave();
			this.playerSlot = null;
			this.onLeaveApproved.invoke();
		}
		else if (data.type === ClientMessageType.LeaveDenied)
		{
			this._requestingLeave = false;
			this.onLeaveDenied.invoke();
		}
		else if (data.type === ClientMessageType.ChangeJobApproved)
		{
			this.playerSlot.job = PlayerJobs.array[data.jobIndex];
		}
		else if (data.type === ClientMessageType.NotReadyApproved)
		{
			this.playerSlot.isReady = false;
			this.onNotReadyApproved.invoke();
		}
		else if (data.type === ClientMessageType.StartGame)
		{
			this.onStartGame.invoke();
		}
		else if (data.type === ClientMessageType.EnterLoggingMinigame)
		{
			this.onEnterLoggingMinigame.invoke(data.health);
		}
		else if (data.type === ClientMessageType.TreeHealthChange)
		{
			this.onTreeHealthChange.invoke(data.health);
		}
		else if (data.type === ClientMessageType.TreeFinished)
		{
			this.onTreeFinished.invoke();
		}
		else if (data.type === ClientMessageType.EnterBuildingMinigame)
		{
			this.onEnterBuildingMinigame.invoke(data.health);
		}
		else if (data.type === ClientMessageType.BuildingHealthChange)
		{
			this.onBuildingHealthChange.invoke(data.health);
		}
		else if (data.type === ClientMessageType.BuildingFinished)
		{
			this.onBuildingFinished.invoke();
		}
		else if (data.type === ClientMessageType.ExitMinigameApproved)
		{
			this._requestingExitMinigame = false;
			this.onExitMinigame.invoke();
		}
		else if (data.type === ClientMessageType.ExitMinigameDenied)
		{
			this._requestingExitMinigame = false;
		}
		else if (data.type === ClientMessageType.GameOver)
		{
			//this.onGameOver.invoke();
			TeamTowerDefense.instance.screenManager.removeAll();
			
			TeamTowerDefense.instance.screenManager.add(new PlayerSelectScreen());
			TeamTowerDefense.instance.screenManager.add(new GameOverScreen());
		}
		else
		{
			// tslint:disable-next-line: no-console
			console.log("OTHER");
		}
	}
}

const PlayerClient:$PlayerClient = new $PlayerClient();
