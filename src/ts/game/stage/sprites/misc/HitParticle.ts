/** @file HitParticle.ts */

class HitParticle extends MapObjBmp implements EffectSprite
{
	public entity:HealthEntity;

	public isDead:boolean = false;

	private life:number = 100;


	public constructor(entity:HealthEntity)
	{
		super(Assets.images.FX_BoltFire);
		this.entity = entity;
		this.regY = 70;
		this.scaleX = this.scaleY = 0.5;

		this.regX = this.texture.width / 2;
		this.regY = this.texture.height / 2;
		this.regY += 50;

		this.regX += (-12 + Math.random() * 12);
		this.regY += (-6 + Math.random() * 6);
	}

	public update(elapsed:number):void
	{
		this.x = this.entity.x;
		this.y = this.entity.y;

		this.life -= elapsed;
		if (this.life <= 0) this.isDead = true;
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.entity.health < this.entity.fullHealth && this.entity.health > 0)
		{
			ctx.drawRect(matrix, alpha, -20, 0, 40, 5, new FillSettings("#FF0000"));
			ctx.drawRect(matrix, alpha, -20, 0, this.entity.health / this.entity.fullHealth * 40, 5, new FillSettings("#00FF00"));
		}

		super.render(ctx, matrix, alpha);
	}
}
