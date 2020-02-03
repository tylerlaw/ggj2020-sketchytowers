/** @file PlayerSprite.ts */
/// <reference path="../../map/MapObjSprite.ts" />

const enum PlayerSpriteState
{
	Idle = 0,
	Walk = 1,
	Attack = 2
}

abstract class PlayerSprite extends MapObjSprite
{
	public static readonly WIDTH:int = 128;
	public static readonly HEIGHT:int = 128;


	protected readonly bmp:Bitmap = new Bitmap(null, 0, 0, PlayerSprite.WIDTH, PlayerSprite.HEIGHT);

	protected readonly _idleFrames:Texture[] = [];
	protected readonly _walkFrames:Texture[] = [];
	protected readonly _attackFrames:Texture[] = [];
	protected frames:Texture[] = this._idleFrames;

	public isDead:boolean = false;


	public readonly index:int;
	public readonly map:Map;
	public readonly color:PlayerColor;
	public readonly pad:ControlPad;
	public readonly job:PlayerJob;

	public readonly geom:CircleGeom = new CircleGeom(24);
	public speed:number = 400;
	public attackDelay:number = 500;

	public state:PlayerSpriteState = PlayerSpriteState.Idle;

	private nearbyTree:TreeSprite = null;
	private nearbyTower:TowerSprite = null;


	private moved:boolean = false;
	private frame:int = 0;
	private step:int = 0;

	private _attackCooldown:number = 0;



	private _attackTimeElapsed:number = 0;
	private readonly _hits:MonsterSprite[] = [];


	public constructor(index:int, map:Map, job:PlayerJob)
	{
		super();

		this.index = index;
		this.map = map;
		this.job = job;

		this.color = PlayerColors.array[this.index];
		this.pad = ControlPad.array[this.index];
	}


	private attack():void
	{
		this._hits.length = 0;
		this._attackTimeElapsed = 0;
		this.setState(PlayerSpriteState.Attack);

		new Sound(Assets.sounds.AXE_WHOOSH).play();
	}


	private distSqr(x:number, y:number):number
	{
		return x * x + y * y;
	}

	public update(elasped:number):void
	{
		this.tick(elasped);

		this._attackCooldown -= elasped;

		// Update nearby
		let cell:Cell = this.map.getCellAt(this.x, this.y);
		if (cell.tree) this.nearbyTree = cell.tree;
		else this.nearbyTree = null;

		if (cell.tower) this.nearbyTower = cell.tower;
		else this.nearbyTower = null;

		// Check if interaction
		if (DisplayClient.room.playerSlots[this.index].choppingTree === null && DisplayClient.room.playerSlots[this.index].repairingBuilding === null)
		{
			if (this.pad.attackButton.isPressed)
			{
				if (this._attackCooldown <= 0)
				{
					this.attack();
					this._attackCooldown = this.attackDelay;
				}
			}
			else if (this.pad.interactButton.justPressed)
			{
				if (this.nearbyTower && !this.nearbyTower.busy && this.nearbyTower.health < 100)
				{

					// Hide nearby tree
					if (this.nearbyTree)
					{
						this.nearbyTree.removeNearbyPlayer();
						this.nearbyTree = null;
					}

					// Hide nearby tree
					if (this.nearbyTree)
					{
						this.nearbyTree.removeNearbyPlayer();
						this.nearbyTree = null;
					}

					// Trigger minigame
					DisplayClient.triggerBuildingMinigame(this.index, this.nearbyTower);
				}
				else if (this.nearbyTree && !this.nearbyTree.busy)
				{
					DisplayClient.triggerLoggingMinigame(this.index, this.nearbyTree);
					this.nearbyTree.removeNearbyPlayer();
					this.nearbyTree = null;
				}
			}
		}

		// Check for hits
		// FIGHTER ONLY
		if (/*this.job === PlayerJobs.Fighter && */this.state === PlayerSpriteState.Attack)
		{
			this._attackTimeElapsed += elasped;
			let attackDur:number = 1000 / 60 * this._attackFrames.length;
			let attackPct:number = this._attackTimeElapsed / attackDur;
			let newHits:MonsterSprite[] = [];
			let v:Vector2 = new Vector2();
			let attackRadiusSqr:number = 192 * 192;
			for (let monster of this.map.monsterSprites)
			{
				if (this._hits.indexOf(monster) < 0)
				{
					if (v.set(monster.x - this.x, monster.y - this.y).lengthSquared() <= attackRadiusSqr)
					{
						let rot:number = MathUtil.RAD_TO_DEG * Math.atan2(v.y, v.x);
						if (rot < 0) rot += 360;
						rot = 180 - rot;
						if (rot < 0) rot += 360;
						rot = rot / 360;
						if (Math.abs(attackPct - rot) <= 1)
						{
							this._hits.push(monster);
							newHits.push(monster);
							new Sound(Assets.sounds.Enemy_Hit_4).play();
						}
					}
				}
			}
			for (let monster of newHits)
			{
				monster.hit(75);
			}
		}
		


		// Advance anim playhead
		this.step += elasped;

		// Update state
		if (this.moved) this.setState(PlayerSpriteState.Walk);
		else this.setState(PlayerSpriteState.Idle);

		// Advance frames
		while (this.step > 1000 / 30)
		{
			if (this.job === PlayerJobs.Fighter && this.state === PlayerSpriteState.Attack) this.step -= 1000 / 60;
			else this.step -= 1000 / 30;
			this.frame++;
			if (this.state === PlayerSpriteState.Attack && this.frame >= this.frames.length)
			{
				this.state = null;
				if (this.moved) this.setState(PlayerSpriteState.Walk);
				else this.setState(PlayerSpriteState.Idle);
			}
			else while (this.frame >= this.frames.length) this.frame -= this.frames.length;
		}

		// Update texture
		let tex:Texture = this.frames[this.frame];
		if (tex !== this.bmp.texture) this.bmp.texture = tex;

		// Reset state
		this.moved = false;
	}



	private setState(state:PlayerSpriteState):void
	{
		if (this.state !== PlayerSpriteState.Attack)
		{
			if (this.state !== state)
			{
				this.state = state;
				this.frame = 0;
				this.step = 0;
				if (state === PlayerSpriteState.Walk) this.frames = this._walkFrames;
				else if (state === PlayerSpriteState.Idle) this.frames = this._idleFrames;
				else if (state === PlayerSpriteState.Attack) this.frames = this._attackFrames;
			}
		}
	}


	private tick(ticks:number):void
	{
		let v:Vector2 = this.pad.stick.vector.clone();

		if (v.lengthSquared() > 0)
		{
			v.x *= (ticks / 1000) * this.speed;
			v.y *= (ticks / 1000) * this.speed;

			let newX:number = this.x + v.x;
			let newY:number = this.y + v.y;

			if (this.tryMove(newX, newY))
			{
				this.moved = true;
				this.setPosition(newX, newY);
			}
			else if (this.tryMove(this.x, newY))
			{
				this.moved = true;
				this.setPosition(this.x, newY);
			}
			else if (this.tryMove(newX, this.y))
			{
				this.moved = true;
				this.setPosition(newX, this.y);
			}
			else
			{
				this.moved = false;
				this.setPosition(this.x, this.y);
			}
		}
		else
		{
			this.moved = false;
		}
	}

	private tryMove(newX:number, newY:number):boolean
	{
		// Update the geom to target position
		this.geom.setOrigin(newX, newY);

		// check grid
		let minR:int = Math.floor((newY - this.geom.radius) / Map.CELL_HEIGHT);
		let minC:int = Math.floor((newX - this.geom.radius) / Map.CELL_WIDTH);
		let maxR:int = Math.floor((newY + this.geom.radius) / Map.CELL_HEIGHT);
		let maxC:int = Math.floor((newX + this.geom.radius) / Map.CELL_WIDTH);
		for (let r:int = minR; r <= maxR; ++r)
		{
			for (let c:int = minC; c <= maxC; ++c)
			{
				let cell:Cell = this.map.getCell(r, c);
				if (!cell)
				{
					return false;
				}
				else if (!cell.walkable)
				{
					let cellGeom:Geom = new SquareGeom(64);
					cellGeom.setOrigin((c + 0.5) * Map.CELL_WIDTH, (r + 0.5) * Map.CELL_HEIGHT);
					if (Collider.isCollision(this.geom, cellGeom).isCollision)
					{
						return false;
					}
				}
			}
		}
		return true;
	}

	public setPosition(x:number, y:number):void
	{
		this.geom.setOrigin(this.x = x, this.y = y);
	}
}
