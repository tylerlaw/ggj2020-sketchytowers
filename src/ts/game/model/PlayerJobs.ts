/** @file PlayerJobs.ts */

/// <reference path="../stage/sprites/pc/EngineerSprite.ts" />
/// <reference path="../stage/sprites/pc/FighterSprite.ts" />
/// <reference path="../stage/sprites/pc/ThiefSprite.ts" />
/// <reference path="../stage/sprites/pc/BardSprite.ts" />

interface PlayerJob {
	readonly index:int;
	readonly name:string;
	readonly spriteClass:{ new (index:int, map:Map):PlayerSprite };
	readonly attack:int;
	readonly defense:int;
	readonly speed:int;
	readonly build:int;
}

// tslint:disable-next-line: typedef
const PlayerJobs = new (class
{
	public readonly Engineer:PlayerJob = { index: 0, name: "Engineer", spriteClass: <any>EngineerSprite, attack: 2, defense: 3, speed: 2, build: 4 };
	public readonly Fighter:PlayerJob = { index: 1, name: "Fighter", spriteClass: <any>FighterSprite, attack: 4, defense: 4, speed: 1, build: 1 };
	public readonly Thief:PlayerJob = { index: 2, name: "Thief", spriteClass: <any>ThiefSprite, attack: 3, defense: 2, speed: 4, build: 1  };
	public readonly Bard:PlayerJob = { index: 3, name: "Bard", spriteClass: <any>BardSprite, attack: 2, defense: 1, speed: 4, build: 2 };

	public readonly array:ReadonlyArray<PlayerJob> = [
		this.Engineer,
		this.Fighter,
		this.Thief,
		this.Bard
	];
})();
