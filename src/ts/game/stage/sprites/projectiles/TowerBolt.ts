/** @file TowerBolt.ts */

class TowerBoltTail extends MapObjSprite implements EffectSprite
{
	public readonly fullLife:number = 150;
	public life:number = this.fullLife;
	public readonly bolt:TowerBolt;
	public isDead:boolean = false;

	public constructor(bolt:TowerBolt)
	{
		super();
		this.bolt = bolt;
	}

	public update(elapsed:number):void
	{
		this.life -= elapsed;
		if (this.life <= 0)
		{
			this.isDead = true;
		}
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		let a:number = Easing.Quadratic.easeIn(1 - this.life / this.fullLife, 1, -1, 1);

		ctx.drawLine(matrix, alpha * a, this.bolt.x, this.bolt.y, this.bolt.fireX, this.bolt.fireY, new StrokeSettings("#FFFFFF", 4));
		ctx.drawLine(matrix, alpha * a, this.bolt.x, this.bolt.y, this.bolt.fireX, this.bolt.fireY, new StrokeSettings("#000000", 1));

		super.render(ctx, matrix, alpha);
	}
}

class TowerBolt extends MapObjBmp implements EffectSprite
{

	public isDead:boolean = false;

	public target:MonsterSprite;

	public readonly targetChest:number = -40;
	public readonly hitRadius:number = 20;
	public readonly speed:number = 1200;
	public readonly damage:number = 25;

	public readonly fireX:number;
	public readonly fireY:number;

	public readonly tail:TowerBoltTail;


	public constructor(fireX:number, fireY:number, target:MonsterSprite)
	{
		super(Assets.images.FX_Bolt);

		this.fireX = fireX;
		this.fireY = fireY;

		this.regX = 0;
		this.regY = this.texture.height / 2;

		this.target = target;
		this.setPosition(fireX, fireY);

		this.updateRotation();

		this.scaleX = this.scaleY = 0.5;

		this.tail = new TowerBoltTail(this);
	}

	private updateRotation():void
	{
		let rads:number = Math.atan2((this.target.y + this.targetChest) - this.y, this.target.x - this.x);
		let degs:number = MathUtil.RAD_TO_DEG * rads;
		this.rotation = degs;
	}

	private checkHit():void
	{
		let targetOffset:Vector2 = new Vector2(this.target.x - this.x, (this.target.y + this.targetChest) - this.y);
		if (targetOffset.lengthSquared() < this.hitRadius * this.hitRadius)
		{
			this.isDead = true;
			this.visible = false;
			this.target.hit(this.damage);
		}
	}


	public update(elapsed:number):void
	{
		let targetOffset:Vector2 = new Vector2(this.target.x - this.x, (this.target.y + this.targetChest) - this.y);
		let targetDist:number = targetOffset.length();
		let delta:number = this.speed * elapsed / 1000;
		if (delta >= targetDist - 1)
		{
			delta = targetDist - 1;
		}
		targetOffset.normalize();
		targetOffset.x *= delta;
		targetOffset.y *= delta;
		this.x += targetOffset.x;
		this.y += targetOffset.y;

		this.updateRotation();

		this.checkHit();
	}
}
