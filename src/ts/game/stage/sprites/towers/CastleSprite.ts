/** @file CastleSprite.ts */

class CastleSprite extends MapObjBmp
{
	private readonly _normalTexture:Texture;

	//private _nearbyPlayerCount:int = 0;

	//private _nearbyPlayerTween:Interpolator = null;

	public health:int = 0;

	public isDestroyed:boolean = true;


	public constructor()
	{
		super(Assets.images.Castle);

		this.regX = this.texture.width / 2;
		this.regY = this.texture.height;
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

	public update(elapsed:number):void
	{
		/*
		if (this._nearbyPlayerTween)
		{
			this._nearbyPlayerTween.update(elapsed);
		}
		*/
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

}
