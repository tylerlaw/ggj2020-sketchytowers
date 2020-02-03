/** @file Map.ts */

/// <reference path="MapDebugLayer.ts" />
/// <reference path="MapObjSprite.ts" />
/// <reference path="../sprites/EffectSprite.ts" />
/// <reference path="../sprites/resources/TreeSprite.ts" />
/// <reference path="../sprites/towers/TowerSprite.ts" />
/// <reference path="../sprites/monsters/MonsterSprite.ts" />
/// <reference path="../sprites/monsters/GruntSprite.ts" />
/// <reference path="../sprites/towers/CastleSprite.ts" />
/// <reference path="AStar.ts" />
/// <reference path="MapLayout.ts" />
/// <reference path="Cell.ts" />
/// <reference path="Waves.ts" />


class Map extends Sprite
{
	public static readonly CELL_WIDTH:number = 128;
	public static readonly CELL_HEIGHT:number = 64;
	public static readonly GRID_WIDTH:number = 15;
	public static readonly GRID_HEIGHT:number = 17;

	public static sortIndex:int = 0;

	public static killCount:int = 0;


	public background:Bitmap = new Bitmap(Assets.images.test_map);
	public debugLayer:MapDebugLayer = new MapDebugLayer(this);
	public objectLayer:Sprite = new Sprite();
	public lowerEffectsLayer:Sprite = new Sprite();
	public effectsLayer:Sprite = new Sprite();
	public upperEffectsLayer:Sprite = new Sprite();

	public playerSprites:PlayerSprite[] = [
		//new FighterSprite(0, this) //,
		//new EngineerSprite(1, this),
		//new EngineerSprite(2, this),
		//new EngineerSprite(3, this)
	];
	public readonly treeSprites:TreeSprite[] = [];
	public readonly monsterSprites:MonsterSprite[] = [];
	public readonly towerSprites:TowerSprite[] = [];
	public readonly effectSprites:EffectSprite[] = [];

	
	public grid:Cell[] = [];


	public readonly monsterSpawns:MonsterSpawn[] = [];


	public static instance:Map;


	public constructor()
	{
		super();

		Waves.current = 0;

		Map.killCount = 0;

		Map.instance = this;

		this.y = -4;
		AStar.initialize(this);

		this.addChild(this.background);
		//this.addChild(this.debugLayer);
		this.addChild(this.objectLayer);
		this.addChild(this.lowerEffectsLayer);
		this.addChild(this.effectsLayer);
		this.addChild(this.upperEffectsLayer);

		this.initGrid();
		this.initLayout();
		this.initNeighbors();

		//this.playerSprites[0].setPosition(900, 220);
		//this.playerSprites[1].setPosition(832, 250);
		//this.playerSprites[2].setPosition(972, 260);
		//this.playerSprites[3].setPosition(896, 298);
		//this.objectLayer.addChild(this.playerSprites[0]);
		//this.objectLayer.addChild(this.playerSprites[1]);
		//this.objectLayer.addChild(this.playerSprites[2]);
		//this.objectLayer.addChild(this.playerSprites[3]);

		let cell:Cell;
		for (let r:int = 0; r < Map.GRID_HEIGHT; ++r)
		{
			for (let c:int = 0; c < Map.GRID_WIDTH; ++c)
			{
				if (r === 0 || c === 0 || r === Map.GRID_HEIGHT - 1 || c === Map.GRID_WIDTH - 1)
				{
					cell = this.getCell(r, c);
					let spawn:MonsterSpawn = new MonsterSpawn(cell);
					this.monsterSpawns.push(spawn);
				}
			}
		}


		let playerSpawns:Cell[] = [
			this.getCell(5, 4),
			this.getCell(4, 3),
			this.getCell(4, 5),
			this.getCell(3, 4)
		];

		if (DisplayClient.room)
		{
		for (let playerSlot of DisplayClient.room.playerSlots)
		{
			if (playerSlot.isPresent)
			{
				let playerSprite:PlayerSprite; //new PlayerSprite(playerSlot.index)
				if (playerSlot.job === PlayerJobs.Fighter) playerSprite = new FighterSprite(playerSlot.index, this);
				else if (playerSlot.job === PlayerJobs.Engineer) playerSprite = new EngineerSprite(playerSlot.index, this);
				else if (playerSlot.job === PlayerJobs.Thief) playerSprite = new ThiefSprite(playerSlot.index, this);
				else playerSprite = new BardSprite(playerSlot.index, this);
				playerSprite.setPosition(playerSpawns[playerSlot.index].x, playerSpawns[playerSlot.index].y);
				this.objectLayer.addChild(playerSprite);
				this.playerSprites.push(playerSprite);
			}
		}
		}


		



		let tower:TowerSprite = new TowerSprite(this);
		cell = this.getCell(6, 7);
		tower.setPosition(cell.x, cell.y + 20);
		this.addTower(tower);
		tower.notDestroyed();

		tower = new TowerSprite(this);
		cell = this.getCell(12, 10);
		tower.setPosition(cell.x, cell.y + 20);
		this.addTower(tower);
		tower.notDestroyed();

		tower = new TowerSprite(this);
		cell = this.getCell(13, 3);
		tower.setPosition(cell.x, cell.y + 20);
		this.addTower(tower);
		tower.notDestroyed();

		tower = new TowerSprite(this);
		cell = this.getCell(5, 3);
		tower.setPosition(cell.x, cell.y + 20);
		this.addTower(tower);
		tower.notDestroyed();



		/*
		let spawnDelay:number = 0;
		for (let i:int = 0; i < 1; ++i)
		{
			let grunt:GruntSprite = new GruntSprite(this, this.monsterSpawns[Math.floor(Math.random() * this.monsterSpawns.length)]);
			this.monsterSprites.push(grunt);
			//let randPos:Vector2 = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
			//grunt.x = randPos.x;
			///grunt.y = randPos.y;
			this.objectLayer.addChild(grunt);
			grunt.spawnDelay = spawnDelay;
			spawnDelay += 1250;

			this.effectSprites.push(grunt.healthBar);
			this.upperEffectsLayer.addChild(grunt.healthBar);
		}
		*/
	}

	private initGrid():void
	{
		this.grid.length = Map.GRID_WIDTH * Map.GRID_HEIGHT;
		for (let r:int = 0; r < Map.GRID_HEIGHT; ++r)
		{
			for (let c:int = 0; c < Map.GRID_WIDTH; ++c)
			{
				let i:int = r * Map.GRID_WIDTH + c;
				this.grid[i] = new Cell(r, c);
			}
		}
	}

	private initLayout():void
	{
		for (let i:int = 0; i < MapLayout.length; ++i)
		{
			let tile:MapTile = MapLayout[i];
			if (tile === MapTile.Castle || tile === MapTile.Water)
			{
				this.grid[i].walkable = false;
				this.grid[i].buildable = false;
			}
			else if (tile === MapTile.Road)
			{
				this.grid[i].buildable = false;
				this.grid[i].isRoad = true;
			}
			else if (tile === MapTile.Tree)
			{
				let tree:TreeSprite = new TreeSprite();
				this.treeSprites.push(tree);
				this.objectLayer.addChild(tree);
				tree.setPosition(this.grid[i].x, this.grid[i].y);

				this.grid[i].hasTree = true;
				this.grid[i].tree = tree;
			}
		}
	}

	private initNeighbors():void
	{
		for (let cell of this.grid)
		{
			if (cell.walkable)
			{
				for (let r:int = cell.r - 1; r <= cell.r + 1; ++r)
				{
					for (let c:int = cell.c - 1; c <= cell.c + 1; ++c)
					{
						let otherCell:Cell = this.getCell(r, c);
						if (otherCell && otherCell.walkable && otherCell !== cell)
						{
							cell.addNeighbor(otherCell);
						}
					}
				}
			}
		}
	}




	public addTower(tower:TowerSprite):void
	{
		this.towerSprites.push(tower);
		this.objectLayer.addChild(tower);

		let cell:Cell = this.getCellAt(tower.x, tower.y);
		cell.hasTower = true;
		cell.tower = tower;

		this.upperEffectsLayer.addChild(tower.healthBar);
		this.effectSprites.push(tower.healthBar);
	}

	public getCellAt(x:number, y:number):Cell
	{
		let r:number = Math.floor(y / Map.CELL_HEIGHT);
		let c:number = Math.floor(x / Map.CELL_WIDTH);
		if (r < 0 || r >= Map.GRID_HEIGHT || c < 0 || c >= Map.GRID_WIDTH) return null;
		return this.grid[Map.GRID_WIDTH * r + c];
	}

	public getCell(r:int, c:int):Cell
	{
		if (r < 0 || r >= Map.GRID_HEIGHT || c < 0 || c >= Map.GRID_WIDTH) return null;
		return this.grid[Map.GRID_WIDTH * r + c];
	}


	public removeTree(tree:TreeSprite):void
	{
		let idx:number = this.treeSprites.indexOf(tree);
		if (idx >= 0)
		{
			this.treeSprites.splice(idx);
			this.objectLayer.removeChild(tree);

			let cell:Cell = this.getCellAt(tree.x, tree.y);
			cell.hasTree = false;
			cell.tree = null;
		}
	}

	public removeMonster(monster:MonsterSprite):void
	{
		this.monsterSprites.splice(this.monsterSprites.indexOf(monster), 1);
		this.objectLayer.removeChild(monster);
	}


	public update(elapsed:number):void
	{
		/*
		let ticks:number = elapsed;
		let targetStep:number = 10;
		while (ticks > 0)
		{
			let step:number = Math.min(ticks, targetStep);
			ticks -= step;

			for (let playerSprite of this.playerSprites)
			{
				playerSprite.tick(elapsed);
			}
		}
		*/

		for (let playerSprite of this.playerSprites)
		{
			playerSprite.update(elapsed);
		}

		if (this.monsterSprites.length === 0)
		{
			Waves.spawn(this);
		}

		for (let monsterSprite of this.monsterSprites)
		{
			monsterSprite.update(elapsed);
		}

		for (let towerSprite of this.towerSprites)
		{
			towerSprite.update(elapsed);
		}

		this.objectLayer.children.sort(ySort);

		for (let treeSprite of this.treeSprites)
		{
			treeSprite.alpha = 1;
			for (let monsterSprite of this.monsterSprites)
			{
				if (monsterSprite.y < treeSprite.y && treeSprite.y - monsterSprite.y < 64 && Math.abs(monsterSprite.x - treeSprite.x) < 48)
				{
					treeSprite.alpha = 0.5;
				}
			}

			if (treeSprite.alpha === 1)
			{
				for (let playerSprite of this.playerSprites)
				{
					if (playerSprite.y < treeSprite.y && treeSprite.y - playerSprite.y < 64 && Math.abs(playerSprite.x - treeSprite.x) < 48)
					{
						treeSprite.alpha = 0.5;
					}
				}
			}
		}

		for (let towerSprite of this.towerSprites)
		{
			towerSprite.alpha = 1;
			for (let monsterSprite of this.monsterSprites)
			{
				if (monsterSprite.y < towerSprite.y && towerSprite.y - monsterSprite.y < 64 + 128 && Math.abs(monsterSprite.x - towerSprite.x) < 48)
				{
					towerSprite.alpha = 0.5;
				}
			}

			if (towerSprite.alpha === 1)
			{
				for (let playerSprite of this.playerSprites)
				{
					if (playerSprite.y < towerSprite.y && towerSprite.y - playerSprite.y < 64 + 128 && Math.abs(playerSprite.x - towerSprite.x) < 48)
					{
						towerSprite.alpha = 0.5;
					}
				}
			}
		}


		for (let i:int = 0; i < this.effectSprites.length; ++i)
		{
			let effectSprite:EffectSprite = this.effectSprites[i];
			effectSprite.update(elapsed);
			if (effectSprite.isDead)
			{
				effectSprite.parent.removeChild(effectSprite);
				this.effectSprites.splice(i, 1);
				i--;
			}
		}
	}

}

function ySort(a:MapObjDisplayObject, b:MapObjDisplayObject):number
{
	if (a.y > b.y) return 1;
	else if (a.y < b.y) return - 1;
	else if (a.sortIndex < b.sortIndex) return -1;
	else return 1;
}
