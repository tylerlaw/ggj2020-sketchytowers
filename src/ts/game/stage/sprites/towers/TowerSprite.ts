/** @file TowerSprite.ts */

/// <reference path="../projectiles/TowerBolt.ts" />


class TowerSprite extends MapObjBmp implements HealthEntity
{
	public readonly fireEffect:Bitmap = new Bitmap(Assets.images.FX_BoltFire);

	private readonly _normalTexture:Texture;
	private readonly _destroyedTexture:Texture;

	public readonly geom:CircleGeom = new CircleGeom(32);

	public busy:boolean = false;

	public hBarHeight:number = 210 / 2;

	//private _nearbyPlayerCount:int = 0;


	public healthBar:HealthBar = new HealthBar(this);


	public health:int = 0;
	public range:number = 128 * 3.5;
	public fireDelay:number = 750;

	public isDestroyed:boolean = true;

	public target:MonsterSprite = null;

	private _cooldown:number = 0;
	
	public readonly fireY:number = -59 * 2;

	public fullHealth:number = 100;

	public map:Map;

	public fireEffectLife:number = 0;


	public constructor(map:Map)
	{
		super(null);

		this.map = map;

		this.healthBar.scaleX = 2;
		this.healthBar.scaleY = 2;

		this._destroyedTexture = this.texture = Assets.images.Tower_Build;
		this._normalTexture = Assets.images.Tower;
		this.srcRect.set(0, 0, this.texture.width, this.texture.height);

		this.regX = this.texture.width / 2;
		this.regY = this.texture.height;

		this.fireEffect.regX = 10;
		this.fireEffect.regY = 25;
		this.fireEffect.y = 70;
		this.fireEffect.x = this.regX;
		this.addChild(this.fireEffect);
		this.fireEffect.visible = false;
	}

	public hit(dmg:number):void
	{
		if (!this.isDestroyed)
		{
			this.health -= dmg;
			if (this.health <= 0)
			{
				this.health = 0;
				this.destroyed();
			}
		}
	}


	public setPosition(x:number, y:number):void
	{
		this.geom.setOrigin(this.x = x, this.y = y);
	}


	public addNearbyPlayer():void
	{
		/*
		this._nearbyPlayerCount++;
		if (this._nearbyPlayerCount === 1)
		{
			this._nearbyPlayerTween = new Interpolator(1, 0.5, 500, 0, Easing.none, new Looper(-1, true));
			this.texture = this._nearbyPlayerTexture;
		}
		*/
	}

	public removeNearbyPlayer():void
	{
		/*
		this._nearbyPlayerCount--;
		if (this._nearbyPlayerCount === 0)
		{
			this._nearbyPlayerTween = null;
			this.texture = this._normalTexture;
		}
		*/
	}


	private distSqr(a:Sprite, b:Sprite):number
	{
		return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
	}

	private isInRange(monster:MonsterSprite):boolean
	{
		if (this.distSqr(this, monster) < this.range * this.range) return true;
		else return false;
	}

	private fire():void
	{
		this._cooldown = this.fireDelay;

		let bolt:TowerBolt = new TowerBolt(this.x, this.y + this.fireY, this.target);
		this.map.effectsLayer.addChild(bolt);
		this.map.effectSprites.push(bolt);

		this.map.lowerEffectsLayer.addChild(bolt.tail);
		this.map.effectSprites.push(bolt.tail);

		this.fireEffectLife = 100;
		this.fireEffect.visible = true;

		let sound:Sound = new Sound(Assets.sounds.Arrow_Shot);
		sound.volume = 0.1;
		sound.play();
	}

	public update(elapsed:number):void
	{
		/*
		if (this._nearbyPlayerTween)
		{
			this._nearbyPlayerTween.update(elapsed);
		}
		*/

		if (this.fireEffectLife > 0)
		{
			this.fireEffectLife -= elapsed;
			if (this.fireEffectLife <= 0)
			{
				this.fireEffect.visible = false;
			}
		}


		this._cooldown -= elapsed;

		if (!this.isDestroyed)
		{
			if (this._cooldown <= 0)
			{
				if (this.target && !this.target.isDead && this.isInRange(this.target))
				{
					this.fire();
				}
				else
				{
					this.target = null;
					let bestDistSquare:number = 0;
					for (let monster of this.map.monsterSprites)
					{
						if (monster.isSpawned && this.isInRange(monster))
						{
							let distSqr:number = this.distSqr(monster, this);
							if (this.target === null || distSqr < bestDistSquare)
							{
								bestDistSquare = distSqr;
								this.target = monster;
							}
						}
					}

					if (this.target) this.fire();
				}
			}
		}
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		/*
		if (this._nearbyPlayerTween)
		{
			alpha = alpha * this._nearbyPlayerTween.value;
		}
		*/

		super.render(ctx, matrix, alpha);
	}

	public notDestroyed():void
	{
		this.isDestroyed = false;
		this.health = 100;
		this.texture = this._normalTexture;
		this.srcRect.set(0, 0, this.texture.width, this.texture.height);
	}

	public destroyed():void
	{
		this.isDestroyed = true;
		this.texture = this._destroyedTexture;
		this.srcRect.set(0, 0, this.texture.width, this.texture.height);
	}
}
