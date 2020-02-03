/** @file DisplayClient.ts */

/// <reference path="../support/ConnectionState.ts" />
/// <reference path="Room.ts" />

class $DisplayClient
{
	public readonly onConnected:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onPlayersReady:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onPlayersUnready:DelegateEvent<Handler> = new DelegateEvent();
	public readonly onPlayerJoined:DelegateEvent<{ (playerIndex:int):void; }> = new DelegateEvent();
	public readonly onPlayerLeft:DelegateEvent<{ (playerIndex:int):void; }> = new DelegateEvent();
	public readonly onPlayerJobChange:DelegateEvent<{ (playerIndex:number, jobIndex:number):void }> = new DelegateEvent();
	public readonly onPlayerReady:DelegateEvent<{ (playerIndex:number):void }> = new DelegateEvent();
	public readonly onPlayerNotReady:DelegateEvent<{ (playerIndex:number):void }> = new DelegateEvent();
	public readonly onTreeFinished:DelegateEvent<{ (treeSprite:TreeSprite):void }> = new DelegateEvent();
	public readonly onBuildingFinished:DelegateEvent<{ (tower:TowerSprite):void }> = new DelegateEvent();


	private _ac:AirConsole;

	public get connectionState():ConnectionState { return this._connectionState; }
	private _connectionState:ConnectionState = ConnectionState.Disconnected;

	public readonly room:Room = new Room();


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

	public unreadyAllPlayers():void
	{
		for (let playerSlot of this.room.playerSlots)
		{
			if (!this.room.inProgress && playerSlot.isPresent && playerSlot.isReady)
			{
				this.room.setUnready(playerSlot.deviceId);
				this._ac.message(playerSlot.deviceId, { type: ClientMessageType.NotReadyApproved });
				this.onPlayerNotReady.invoke(playerSlot.index);
			}
		}
	}

	public startGame():void
	{
		if (this.room.allReady)
		{
			this.room.startGame();
			this._ac.broadcast({ type: ClientMessageType.StartGame });
		}
	}

	public triggerLoggingMinigame(playerIndex:int, tree:TreeSprite):void
	{
		if (TeamTowerDefense.instance.isLocalTest)
		{
			TeamTowerDefense.instance.screenManager.add(new MinigameLoggingScreen(tree.health));
		}
		else
		{
			tree.busy = true;

			let playerSlot:PlayerSlot = this.room.playerSlots[playerIndex];
			//if (playerSlot.minigameStatus === MinigameStatus.None)
			//{
				//playerSlot.minigameStatus = MinigameStatus.Logging;
				playerSlot.choppingTree = tree;
				this._ac.message(playerSlot.deviceId, {
					type: ClientMessageType.EnterLoggingMinigame,
					health: tree.health
				});
			//}
		}
	}

	public triggerBuildingMinigame(playerIndex:int, tower:TowerSprite):void
	{
		if (TeamTowerDefense.instance.isLocalTest)
		{
			TeamTowerDefense.instance.screenManager.add(new MinigameBuildingScreen(tower.health));
		}
		else
		{
			tower.busy = true;

			let playerSlot:PlayerSlot = this.room.playerSlots[playerIndex];
			//if (playerSlot.minigameStatus === MinigameStatus.None)
			//{
				//playerSlot.minigameStatus = MinigameStatus.Building;
				playerSlot.repairingBuilding = tower;
				this._ac.message(playerSlot.deviceId, {
					type: ClientMessageType.EnterBuildingMinigame,
					health: tower.health
				});
			//}
		}
	}


	private ac_onReady(code:string):void
	{
		//console.log("ready", code);
		this._connectionState = ConnectionState.Connected;
		this.onConnected.invoke();
	}

	private ac_onConnect(deviceId:number):void
	{
		//console.log("onConnect", deviceId);
	}

	private ac_onDisconnect(deviceId:number):void
	{
		//console.log("onDisonnect", deviceId);
	}

	private ac_onDeviceStateChange(deviceId:number, userData:any):void
	{
		//console.log("onDeviceStateChange", deviceId, userData);
	}

	

	private ac_onMessage(deviceId:number, data:any):void
	{
		console.log("onMessage", deviceId, data);

		if (data.type === ClientMessageType.IsJoinAvailable)
		{
			if (!this.room.isFull) this._ac.message(deviceId, { type: ClientMessageType.JoinAvailable });
			else this._ac.message(deviceId, { type: ClientMessageType.JoinUnavailable });
		}
		else if (data.type === ClientMessageType.RequestJoin)
		{
			if (!this.room.isFull)
			{
				// Room isn't full
				this.room.add(deviceId);
				let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
				this._ac.message(deviceId, {
					type: ClientMessageType.JoinApproved,
					playerIndex: playerSlot.index,
					jobIndex: playerSlot.job.index
				});

				if (this.room.isFull) this._ac.broadcast({ type: ClientMessageType.JoinUnavailable });

				this.onPlayerJoined.invoke(playerSlot.index);
			}
			else
			{
				// Room full
				this._ac.message(deviceId, { type: ClientMessageType.JoinDenied });
			}
		}
		else if (data.type === ClientMessageType.RequestLeave)
		{
			if (!this.room.isPlayer(deviceId) || !this.room.inProgress)
			{
				let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
				this.room.remove(deviceId);
				this._ac.message(deviceId, { type: ClientMessageType.LeaveApproved });

				if (!this.room.isFull) this._ac.broadcast({ type: ClientMessageType.JoinAvailable });

				this.onPlayerLeft.invoke(playerSlot.index);
			}
			else
			{
				this._ac.message(deviceId, { type: ClientMessageType.LeaveDenied });
			}
		}
		else if (data.type === ClientMessageType.RequestChangeJob)
		{
			if (this.room.isPlayer(deviceId) && !this.room.inProgress)
			{
				let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
				playerSlot.job = PlayerJobs.array[data.jobIndex];
				this._ac.message(deviceId, { type: ClientMessageType.ChangeJobApproved, jobIndex: data.jobIndex });

				this.onPlayerJobChange.invoke(playerSlot.index, playerSlot.job.index);
			}
		}
		else if (data.type === ClientMessageType.Ready)
		{
			if (!this.room.inProgress)
			{
				this.room.setReady(deviceId);

				if (this.room.isPlayer(deviceId))
				{
					this.onPlayerReady.invoke(this.room.getPlayerSlot(deviceId).index);
				}
			}
		}
		else if (data.type === ClientMessageType.RequestNotReady)
		{
			if (!this.room.inProgress)
			{
				this.room.setUnready(deviceId);
				this._ac.message(deviceId, { type: ClientMessageType.NotReadyApproved });

				if (this.room.isPlayer(deviceId))
				{
					this.onPlayerNotReady.invoke(this.room.getPlayerSlot(deviceId).index);
				}
			}
		}
		else if (data.type === ClientMessageType.ControlsChanged)
		{
			let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
			let pad:ControlPad = ControlPad.array[playerSlot.index];
			pad.update(
				data.degs,
				data.move,
				data.attack,
				data.interact,
				data.build
			);
		}
		else if (data.type === ClientMessageType.RequestExitMinigame)
		{
			let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
			this._ac.message(playerSlot.deviceId, {
				type: ClientMessageType.ExitMinigameApproved
			});
			//playerSlot.minigameStatus = MinigameStatus.None;
			if (playerSlot.choppingTree) playerSlot.choppingTree.busy = false;
			playerSlot.choppingTree = null;
			if (playerSlot.repairingBuilding) playerSlot.repairingBuilding.busy = false;
			playerSlot.repairingBuilding = null;

			/*
			let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
			if (playerSlot.isPresent && playerSlot.minigameStatus !== MinigameStatus.None)
			{
				this._ac.message(playerSlot.deviceId, {
					type: ClientMessageType.ExitMinigameApproved
				});
				playerSlot.minigameStatus = MinigameStatus.None;
				playerSlot.choppingTree = null;
			}
			else
			{
				this._ac.message(playerSlot.deviceId, {
					type: ClientMessageType.ExitMinigameDenied
				});
			}
			*/
		}
		else if (data.type === ClientMessageType.ChoppedLog)
		{
			let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
			if (playerSlot.isPresent /*&& playerSlot.minigameStatus === MinigameStatus.Logging*/ && playerSlot.choppingTree)
			{
				// Change the health
				playerSlot.choppingTree.health -= playerSlot.job.build * 2;	// 10 swipes for an engineer with a 5pt build rating
				if (playerSlot.choppingTree.health < 0) playerSlot.choppingTree.health = 0;
				for (let slot of this.room.playerSlots)
				{
					if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Logging */ slot.choppingTree === playerSlot.choppingTree)
					{
						this._ac.message(slot.deviceId, {
							type: ClientMessageType.TreeHealthChange,
							health: playerSlot.choppingTree.health
						});
					}
				}

				// check if finished
				if (playerSlot.choppingTree.health <= 0)
				{
					let choppingTree:TreeSprite = playerSlot.choppingTree;
					for (let slot of this.room.playerSlots)
					{
						if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Logging*/ slot.choppingTree === choppingTree)
						{
							this._ac.message(slot.deviceId, {
								type: ClientMessageType.TreeFinished
							});
							//slot.minigameStatus = MinigameStatus.None;
							slot.choppingTree = null;
						}
					}
					GameState.logs++;
					this.onTreeFinished.invoke(choppingTree);

					let tower:TowerSprite = new TowerSprite(Map.instance);
					tower.setPosition(choppingTree.x, choppingTree.y + 20);
					Map.instance.addTower(tower);

					new Sound(Assets.sounds.Chopping_Complete).play();
				}
			}
		}
		else if (data.type === ClientMessageType.HitNail)
		{
			let playerSlot:PlayerSlot = this.room.getPlayerSlot(deviceId);
			if (playerSlot.isPresent /*&& playerSlot.minigameStatus === MinigameStatus.Building*/ && playerSlot.repairingBuilding)
			{
				playerSlot.repairingBuilding.health += playerSlot.job.build * 2;	// 10 swipes for an engineer with a 5pt build rating
				if (playerSlot.repairingBuilding.health > 100) playerSlot.repairingBuilding.health = 100;
				for (let slot of this.room.playerSlots)
				{
					if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Building &&*/ slot.repairingBuilding === playerSlot.repairingBuilding)
					{
						this._ac.message(slot.deviceId, {
							type: ClientMessageType.BuildingHealthChange,
							health: playerSlot.repairingBuilding.health
						});
					}
				}
				if (playerSlot.repairingBuilding.health >= 100)
				{
					let repairingBuilding:TowerSprite = playerSlot.repairingBuilding;
					for (let slot of this.room.playerSlots)
					{
						if (slot.isPresent && /*slot.minigameStatus === MinigameStatus.Building &&*/ slot.repairingBuilding === repairingBuilding)
						{
							this._ac.message(slot.deviceId, {
								type: ClientMessageType.BuildingFinished
							});
							//slot.minigameStatus = MinigameStatus.None;
							slot.repairingBuilding = null;
						}
					}
					//GameState.logs++;
					repairingBuilding.busy = false;
					repairingBuilding.notDestroyed();
					this.onBuildingFinished.invoke(repairingBuilding);
					new Sound(Assets.sounds.Chopping_Complete).play();
				}
			}
		}
	}

	public triggerGameOver():void
	{
		if (TeamTowerDefense.instance.isLocalTest) return;


		for (let playerSlot of this.room.playerSlots)
		{
			if (playerSlot.isPresent)
			{
				this._ac.message(playerSlot.deviceId, {
					type: ClientMessageType.GameOver
				});


				playerSlot.choppingTree = null;
				playerSlot.repairingBuilding = null;
				playerSlot.isReady = false;
			}
		}
		this.room.allReady = false;
		this.room.inProgress = false;
	}
}

const DisplayClient:$DisplayClient = new $DisplayClient();
