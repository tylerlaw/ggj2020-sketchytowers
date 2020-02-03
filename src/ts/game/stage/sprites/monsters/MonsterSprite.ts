/** @file MonsterSprite.ts */

/// <reference path="../misc/HealthBar.ts" />
/// <reference path="../misc/HitParticle.ts" />

class MonsterSpawn
{
	public pos:Vector2 = new Vector2();
	public cell:Cell;

	public constructor(cell:Cell)
	{
		this.cell = cell;

		this.pos.copy(cell.center);
		if (cell.r === 0)
		{
			this.pos.y -= Map.CELL_HEIGHT * 2;
		}
		if (cell.c === 0) this.pos.x -= Map.CELL_WIDTH * 2;
		if (cell.r === Map.GRID_HEIGHT - 1) this.pos.y += Map.CELL_HEIGHT * 3;
		if (cell.c === Map.GRID_WIDTH - 1) this.pos.x += Map.CELL_WIDTH * 2;
	}
}

abstract class MonsterSprite extends MapObjBmp implements HealthEntity
{
	public map:Map;

	public pathNodes:Vector2[] = null;
	public firstPathing:boolean = true;

	public healthBar:HealthBar = new HealthBar(this);

	
	public abstract health:number;
	public abstract fullHealth:number;

	public spawnDelay:number = 0;
	public isSpawned:boolean = false;
	public isDead:boolean = false;

	public hBarHeight:number = 70 * 2;



	public constructor(map:Map, texture:Texture)
	{
		super(texture);
		this.map = map;
	}


	public abstract update(elapsed:number):void;


	public hit(damage:number):void
	{
		if (!this.isDead)
		{
			this.health -= damage;
			if (this.health < 0) this.health = 0;
			if (this.health <= 0)
			{
				this.isDead = true;
				this.map.removeMonster(this);
				this.healthBar.isDead = true;
				Map.killCount++;
			}
			let hitPar:HitParticle = new HitParticle(this);
			this.map.lowerEffectsLayer.addChild(hitPar);
			this.map.effectSprites.push(hitPar);
		}
	}
}
