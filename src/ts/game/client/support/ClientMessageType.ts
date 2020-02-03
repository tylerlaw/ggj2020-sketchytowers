/** @file ClientMessageType.ts */

const enum ClientMessageType
{
	//#region Server to Client
	JoinAvailable = "JoinAvailable",
	JoinUnavailable = "JoinUnavailable",

	JoinApproved = "JoinApproved",
	JoinDenied = "JoinDenied",

	LeaveApproved = "LeaveApproved",
	LeaveDenied = "LeaveDenied",

	ChangeJobApproved = "ChangeJobApproved",

	NotReadyApproved = "NotReadyApproved",

	StartGame = "StartGame",

	EnterLoggingMinigame = "EnterLoggingMinigame",
	TreeHealthChange = "TreeHealthChange",
	TreeFinished = "TreeFinished",

	EnterBuildingMinigame = "EnterBuildingMinigame",
	BuildingHealthChange = "BuildingHealthChange",
	BuildingFinished = "BuildingFinished",

	ExitMinigameApproved = "ExitMinigameApproved",
	ExitMinigameDenied = "ExitMinigameDenied",

	GameOver = "GameOver",
	//#endregion


	//#region Client to Server
	IsJoinAvailable = "IsJoinAvailable",

	RequestJoin = "RequestJoin",

	RequestLeave = "RequestLeave",

	RequestChangeJob = "RequestChangeJob",

	Ready = "Ready",
	RequestNotReady = "RequestNotReady",

	ControlsChanged = "ControlsChanged",

	ChoppedLog = "ChoppedLog",
	HitNail = "HitNail",

	RequestExitMinigame = "RequestExitMinigame"
	//#endregion
}
