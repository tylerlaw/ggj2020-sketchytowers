/** @file GameState.ts */

class $GameState
{
	public logs:number = 999;
	public coins:number = 0;


	public reset():void
	{
		this.logs = 0;
		this.coins = 0;
	}
}
const GameState:$GameState = new $GameState();
