/** @file PlayerColors.ts */

interface PlayerColor {
	readonly index:int;
	readonly name:string;
	readonly main:string;
}

// tslint:disable-next-line: typedef
const PlayerColors = new (class
{
	public readonly Red:PlayerColor = { index: 0, name: "Red", main: "#FF0000" };
	public readonly Blue:PlayerColor = { index: 1, name: "Blue", main: "#3300FF" };
	public readonly Green:PlayerColor = { index: 2, name: "Green", main: "#33CC00" };
	public readonly Yellow:PlayerColor = { index: 3, name: "Cyan", main: "#33CCFF" };

	public readonly array:ReadonlyArray<PlayerColor> = [
		this.Red,
		this.Blue,
		this.Green,
		this.Yellow
	];
})();
