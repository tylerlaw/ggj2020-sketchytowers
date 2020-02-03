/** @file TreeSprite.ts */

class TreeSprite extends MapObjBmp
{
	public health:int = 100;
	public busy:boolean = false;
	private _nearbyPlayerCount:int = 0;


	public constructor()
	{
		super(Assets.images.Tree);

		this.regX = this.texture.width / 2;
		this.regY = 67 * 2;
	}

	public addNearbyPlayer():void
	{
		this._nearbyPlayerCount++;
		if (this._nearbyPlayerCount > 0)
		{
			// todo, show arrow
		}
	}

	public removeNearbyPlayer():void
	{
		this._nearbyPlayerCount--;
		if (this._nearbyPlayerCount === 0)
		{
			// todo, hide arrow
		}
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		super.render(ctx, matrix, alpha);
	}
}
