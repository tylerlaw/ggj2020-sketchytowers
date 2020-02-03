/** @file PlayerSlot.ts */

/// <reference path="../../model/PlayerJobs.ts" />
/// <reference path="../../model/PlayerColors.ts" />

/*
const enum MinigameStatus
{
	None = 0,
	Logging = 1,
	Building = 2
}
*/

class PlayerSlot
{
	public readonly index:int;

	public get deviceId():int { return this._deviceId; }
	private _deviceId:int = -1;

	public get isPresent():boolean { return this.deviceId > 0; }

	public color:PlayerColor;

	public job:PlayerJob;

	public isReady:boolean = false;

	//public minigameStatus:MinigameStatus = MinigameStatus.None;
	public choppingTree:TreeSprite = null;
	public repairingBuilding:TowerSprite = null;


	public constructor(index:int)
	{
		this.index = index;
		this.color = PlayerColors.array[index];
		this.job = PlayerJobs.array[index];
	}


	public join(deviceId:int):void
	{
		this._deviceId = deviceId;
	}

	public leave():void
	{
		this._deviceId = -1;
		this.isReady = false;
	}
}
