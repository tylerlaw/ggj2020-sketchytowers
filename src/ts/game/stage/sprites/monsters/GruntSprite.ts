/** @file GruntSprite.ts */

const enum GruntState
{
	Idle,
	Move,
	Attack
}

class GruntSprite extends MonsterSprite
{
	public health:number = 300; //900;
	public fullHealth:number = 300; //900;
	public damage:number = 10; //100;
	public speed:number = 200; // 100; //500;


	public idleFrames:Texture[];
	public walkFrames:Texture[];
	public attackFrames:Texture[];


	protected target:TowerSprite = null;
	protected isTowerTarget:boolean = false;

	public spawn:MonsterSpawn;

	public startCell:Cell;

	public state:GruntState = GruntState.Idle;

	public step:number = 0;
	public frame:number = 0;
	public frames:Texture[];


	
	private _cooldown:number = 0;


	public constructor(map:Map, spawn:MonsterSpawn)
	{
		super(map, Assets.images.baddie_frames0001);

		this.idleFrames = [
			Assets.images.baddie_frames0001
		];

		this.walkFrames = [
			Assets.images.baddie_frames0002,
			Assets.images.baddie_frames0003,
			Assets.images.baddie_frames0004,
			Assets.images.baddie_frames0005,
			Assets.images.baddie_frames0006,
			Assets.images.baddie_frames0007,
			Assets.images.baddie_frames0008,
			Assets.images.baddie_frames0009,
			Assets.images.baddie_frames0010,
			Assets.images.baddie_frames0011,
			Assets.images.baddie_frames0012,
			Assets.images.baddie_frames0013
		];

		this.attackFrames = [
			Assets.images.baddie_frames0017,
			Assets.images.baddie_frames0018,
			Assets.images.baddie_frames0019,
			Assets.images.baddie_frames0020,
			Assets.images.baddie_frames0021,
			Assets.images.baddie_frames0022,
			Assets.images.baddie_frames0023,
			Assets.images.baddie_frames0024
		];


		this.scaleX = this.scaleY = 2;
		this.regX = this.texture.width / 2;
		this.regY = this.texture.height;

		this.spawn = spawn;
		this.setPosition(this.spawn.pos.x, this.spawn.pos.y);
		this.startCell = this.spawn.cell;

		//this.setPosition(this.pathNodes[0].x, this.pathNodes[0].y);

		//this.pathNodes = AStar.findPath(new Vector2(650, 873), new Vector2(896, 200));
		//this.setPosition(this.pathNodes[0].x, this.pathNodes[0].y);
	}

	private attack():void
	{
		this.target.hit(this.damage);
		this._cooldown = 1500;

		this.state = GruntState.Attack;
		this.step = 0;
		this.frame = 0;
		this.frames = this.attackFrames;
	}


	public update(elapsed:number):void
	{
		this._cooldown -= elapsed;

		// Spawn Delay
		if (this.spawnDelay > 0)
		{
			this.spawnDelay -= elapsed;
			if (this.spawnDelay > 0) return;
		}

		let moved:boolean = false;
		if (this.state !== GruntState.Attack)
		{
			// Choose a target
			let v:Vector2 = new Vector2();
			if (!this.target || this.target.isDestroyed)
			{
				this.target = null;
				this.pathNodes = null;
				let d:number = 0;
				for (let tower of this.map.towerSprites)
				{
					if (tower.isDestroyed) continue;
					let dist:number = v.set(tower.x - this.x, tower.y - this.y).lengthSquared();
					if (!this.target || dist < d)
					{
						this.target = tower;
						d = dist;
					}
				}
			}

			// check if close enough to target;
			let tDist:number = this.target ? v.set(this.target.x - this.x, this.target.y - this.y).lengthSquared() : 0;
			if (this.target && tDist <= (Map.CELL_HEIGHT) * (Map.CELL_HEIGHT))
			{
				this.pathNodes = null;

				// TODO: ATTACK
				if (this._cooldown <= 0)
				{
					this.attack();
				}
			}
			else if (this.target)
			{
				if (!this.pathNodes)
				{
					let cell:Cell = this.map.getCellAt(this.x, this.y);

					if (!cell)
					{
						this.pathNodes = AStar.findPath(new Vector2(this.startCell.x, this.startCell.y), new Vector2(this.target.x, this.target.y));
					}
					else
					{
						this.pathNodes = AStar.findPath(new Vector2(this.x, this.y), new Vector2(this.target.x, this.target.y));
					}
				}
			}

			if (this.pathNodes && this.pathNodes.length > 0)
			{
				moved = true;
				let distLeft:number = this.speed * elapsed / 1000;
				while (distLeft > 0)
				{
					let nextNode:Vector2 = this.pathNodes[0];
					let offset:Vector2 = new Vector2(nextNode.x - this.x, nextNode.y - this.y);
					let distTo:number = offset.length();
					if (distTo <= distLeft)
					{
						distLeft -= offset.length();
						this.setPosition(nextNode.x, nextNode.y);
						this.pathNodes.shift();
						this.isSpawned = true;
						if (this.pathNodes.length === 0)
						{
							distLeft = 0;
							moved = false;
						}
					}
					else
					{
						let newPos:Vector2 = offset.interpolate(distLeft / distTo);
						this.setPosition(this.x + newPos.x, this.y + newPos.y);
						distLeft = 0;
					}
				}
			}
		}



		// Advance anim playhead
		this.step += elapsed;

		// Update state
		if (moved)
		{
			if (this.state !== GruntState.Move)
			{
				this.state = GruntState.Move;
				this.step = 0;
				this.frame = 0;
				this.frames = this.walkFrames;
			}
		}
		else if (this.state !== GruntState.Attack)
		{
			this.state = GruntState.Idle;
			this.step = 0;
			this.frame = 0;
			this.frames = this.idleFrames;
		}

		// Advance frames
		while (this.step > 1000 / 30)
		{
			this.step -= 1000 / 30;
			this.frame++;
			if (this.state === GruntState.Attack && this.frame >= this.frames.length)
			{
				this.state = GruntState.Idle;
				this.step = 0;
				this.frame = 0;
				this.frames = this.idleFrames;
			}
			else while (this.frame >= this.frames.length) this.frame -= this.frames.length;
		}

		// Update texture
		let tex:Texture = this.frames[this.frame];
		if (tex !== this.texture) this.texture = tex;
	}
}
