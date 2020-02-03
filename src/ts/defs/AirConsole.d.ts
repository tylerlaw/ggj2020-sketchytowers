
declare module AirConsole
{
	declare interface Config
	{
		orientation:string;
		synchronizeTime?:boolean;
		setup_document?:boolean;
		device_motion?:number;
	}

	declare interface DeviceState
	{
		uid:string;
		custom:string | undefined;
		nickname:string | undefined;
		slow_connection:boolean | undefined;
	}
}

declare class AirConsole
{
	static ORIENTATION_LANDSCAPE:string;
	static ORIENTATION_PORTRAIT:string;
	static SCREEN:number;

	onConnect:{ (deviceId:number):void };
	onDisconnect:{ (deviceId:number):void };
	onReady:{ (code:string):void; }
	onMessage:{ (deviceId:number, data:any):void; }
	onActivePlayersChange:{ (playerNumber:number | undefined):void };
	onDeviceStateChange:{ (deviceId:number, userData:AirConsole.DeviceState) }

	constructor(config?:AirConsole.Config);

	getControllerDeviceIds():number[];
	getDeviceId():number;
	getMasterControllerDeviceId():number | undefined;
	getServerTime():number;

	/**
	 * Sends a messsage to all connected devices.
	 * @param data 
	 */
	broadcast(data:any):void;

	/**
	 * Sends a message to another device.
	 * @param deviceId 
	 * @param data 
	 */
	message(deviceId:number, data:any):void;
}
