/** @file Room.ts */

/// <reference path="PlayerSlot.ts" />

class Room
{
	public readonly maxPlayers:int = 4;
	public numPlayers:int = 0;

	public get isFull():boolean { return this.inProgress || this.numPlayers >= this.maxPlayers; }

	public inProgress:boolean = false;

	public readonly playerSlots:ReadonlyArray<PlayerSlot> = [
		new PlayerSlot(0),
		new PlayerSlot(1),
		new PlayerSlot(2),
		new PlayerSlot(3)
	];
	private readonly _deviceToPlayerSlot:Dictionary<PlayerSlot> = {};

	public allReady:boolean = false;


	public add(deviceId:int):void
	{
		if (this.isPlayer(deviceId)) return;

		let playerSlot:PlayerSlot;
		for (let i:int = 0; i < this.playerSlots.length; ++i)
		{
			if (!this.playerSlots[i].isPresent)
			{
				playerSlot = this.playerSlots[i];
				break;
			}
		}

		playerSlot.join(deviceId);
		this.numPlayers++;
		this._deviceToPlayerSlot[deviceId] = playerSlot;

		this.checkAllReady();
	}

	public remove(deviceId:int):void
	{
		if (!this.isPlayer(deviceId)) return;

		let playerSlot:PlayerSlot = this._deviceToPlayerSlot[deviceId];
		playerSlot.leave();
		this.numPlayers--;
		delete this._deviceToPlayerSlot[deviceId];

		this.checkAllReady();

		if (this.allReady)
		{
			DisplayClient.unreadyAllPlayers();
		}
	}

	public isPlayer(deviceId:int):boolean
	{
		let playerSlot:PlayerSlot = this._deviceToPlayerSlot[deviceId] || null;
		return playerSlot !== null;
	}

	public getPlayerSlot(deviceId:int):PlayerSlot
	{
		let playerSlot:PlayerSlot = this._deviceToPlayerSlot[deviceId] || null;
		return playerSlot;
	}

	public setReady(deviceId:int):void
	{
		let playerSlot:PlayerSlot = this._deviceToPlayerSlot[deviceId] || null;
		if (playerSlot && !playerSlot.isReady)
		{
			playerSlot.isReady = true;
			this.checkAllReady();
		}
	}

	public setUnready(deviceId:int):void
	{
		let playerSlot:PlayerSlot = this._deviceToPlayerSlot[deviceId] || null;
		if (playerSlot && playerSlot.isReady)
		{
			playerSlot.isReady = false;
			this.checkAllReady();
		}
	}

	private checkAllReady():void
	{
		let numReadyPlayers:int = 0;
		for (let playerSlot of this.playerSlots)
		{
			if (playerSlot.isPresent && playerSlot.isReady)
			{
				numReadyPlayers++;
			}
		}

		let newAllReady:boolean = numReadyPlayers >= this.numPlayers;

		if (newAllReady !== this.allReady)
		{
			this.allReady = newAllReady;
			if (newAllReady) DisplayClient.onPlayersReady.invoke();
			else DisplayClient.onPlayersUnready.invoke();
		}
	}

	public startGame():void
	{
		this.inProgress = true;
		for (let playerSlot of this.playerSlots)
		{
			playerSlot.isReady = false;
		}
	}
}
