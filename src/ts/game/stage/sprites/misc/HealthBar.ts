/** @file HealthBar.ts */

interface HealthEntity extends Sprite
{
	health:number;
	fullHealth:number;
	hBarHeight:number;
}

class HealthBar extends MapObjSprite implements EffectSprite
{
	public entity:HealthEntity;

	public isDead:boolean = false;


	public constructor(entity:HealthEntity)
	{
		super();
		this.entity = entity;
		this.regY = entity.hBarHeight;
	}

	public update(elapsed:number):void
	{
		this.x = this.entity.x;
		this.y = this.entity.y;
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.entity.health < this.entity.fullHealth)
		{
			ctx.drawRect(matrix, alpha, -20, 0, 40, 5, new FillSettings("#FF0000"));
			if (this.entity.health > 0) ctx.drawRect(matrix, alpha, -20, 0, this.entity.health / this.entity.fullHealth * 40, 5, new FillSettings("#00FF00"));
		}

		super.render(ctx, matrix, alpha);
	}
}
