/** @file BardSprite.ts */

/// <reference path="PlayerSprite.ts" />

class BardSprite extends PlayerSprite
{

	
	public constructor(index:int, map:Map)
	{
		super(index, map, PlayerJobs.Bard);

		
		if (this.color === PlayerColors.Red)
		{
			this._idleFrames.push(Assets.images.fighter_red_fighter0001);

			this._walkFrames.push(Assets.images.fighter_red_fighter0002);
			this._walkFrames.push(Assets.images.fighter_red_fighter0003);
			this._walkFrames.push(Assets.images.fighter_red_fighter0004);
			this._walkFrames.push(Assets.images.fighter_red_fighter0005);
			this._walkFrames.push(Assets.images.fighter_red_fighter0006);
			this._walkFrames.push(Assets.images.fighter_red_fighter0007);
			this._walkFrames.push(Assets.images.fighter_red_fighter0008);
			this._walkFrames.push(Assets.images.fighter_red_fighter0009);
			this._walkFrames.push(Assets.images.fighter_red_fighter0010);
			this._walkFrames.push(Assets.images.fighter_red_fighter0011);
			this._walkFrames.push(Assets.images.fighter_red_fighter0012);
			this._walkFrames.push(Assets.images.fighter_red_fighter0013);

			this._attackFrames.push(Assets.images.fighter_red_fighter0015);
			this._attackFrames.push(Assets.images.fighter_red_fighter0016);
			this._attackFrames.push(Assets.images.fighter_red_fighter0017);
			this._attackFrames.push(Assets.images.fighter_red_fighter0018);
			this._attackFrames.push(Assets.images.fighter_red_fighter0019);
			this._attackFrames.push(Assets.images.fighter_red_fighter0020);
			this._attackFrames.push(Assets.images.fighter_red_fighter0021);
			this._attackFrames.push(Assets.images.fighter_red_fighter0022);
			this._attackFrames.push(Assets.images.fighter_red_fighter0023);
			this._attackFrames.push(Assets.images.fighter_red_fighter0024);
			this._attackFrames.push(Assets.images.fighter_red_fighter0025);
			this._attackFrames.push(Assets.images.fighter_red_fighter0026);
			this._attackFrames.push(Assets.images.fighter_red_fighter0027);
			this._attackFrames.push(Assets.images.fighter_red_fighter0028);
			this._attackFrames.push(Assets.images.fighter_red_fighter0029);
			this._attackFrames.push(Assets.images.fighter_red_fighter0030);
		}
		else if (this.color === PlayerColors.Blue)
		{
			this._idleFrames.push(Assets.images.fighter_blue_fighter0001);

			this._walkFrames.push(Assets.images.fighter_blue_fighter0002);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0003);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0004);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0005);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0006);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0007);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0008);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0009);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0010);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0011);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0012);
			this._walkFrames.push(Assets.images.fighter_blue_fighter0013);

			this._attackFrames.push(Assets.images.fighter_blue_fighter0015);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0016);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0017);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0018);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0019);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0020);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0021);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0022);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0023);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0024);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0025);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0026);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0027);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0028);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0029);
			this._attackFrames.push(Assets.images.fighter_blue_fighter0030);
		}
		else if (this.color === PlayerColors.Yellow)
		{
			this._idleFrames.push(Assets.images.fighter_cyan_fighter0001);

			this._walkFrames.push(Assets.images.fighter_cyan_fighter0002);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0003);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0004);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0005);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0006);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0007);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0008);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0009);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0010);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0011);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0012);
			this._walkFrames.push(Assets.images.fighter_cyan_fighter0013);

			this._attackFrames.push(Assets.images.fighter_cyan_fighter0015);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0016);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0017);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0018);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0019);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0020);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0021);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0022);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0023);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0024);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0025);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0026);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0027);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0028);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0029);
			this._attackFrames.push(Assets.images.fighter_cyan_fighter0030);
		}
		else
		{
			this._idleFrames.push(Assets.images.fighter_green_fighter0001);

			this._walkFrames.push(Assets.images.fighter_green_fighter0002);
			this._walkFrames.push(Assets.images.fighter_green_fighter0003);
			this._walkFrames.push(Assets.images.fighter_green_fighter0004);
			this._walkFrames.push(Assets.images.fighter_green_fighter0005);
			this._walkFrames.push(Assets.images.fighter_green_fighter0006);
			this._walkFrames.push(Assets.images.fighter_green_fighter0007);
			this._walkFrames.push(Assets.images.fighter_green_fighter0008);
			this._walkFrames.push(Assets.images.fighter_green_fighter0009);
			this._walkFrames.push(Assets.images.fighter_green_fighter0010);
			this._walkFrames.push(Assets.images.fighter_green_fighter0011);
			this._walkFrames.push(Assets.images.fighter_green_fighter0012);
			this._walkFrames.push(Assets.images.fighter_green_fighter0013);

			this._attackFrames.push(Assets.images.fighter_green_fighter0015);
			this._attackFrames.push(Assets.images.fighter_green_fighter0016);
			this._attackFrames.push(Assets.images.fighter_green_fighter0017);
			this._attackFrames.push(Assets.images.fighter_green_fighter0018);
			this._attackFrames.push(Assets.images.fighter_green_fighter0019);
			this._attackFrames.push(Assets.images.fighter_green_fighter0020);
			this._attackFrames.push(Assets.images.fighter_green_fighter0021);
			this._attackFrames.push(Assets.images.fighter_green_fighter0022);
			this._attackFrames.push(Assets.images.fighter_green_fighter0023);
			this._attackFrames.push(Assets.images.fighter_green_fighter0024);
			this._attackFrames.push(Assets.images.fighter_green_fighter0025);
			this._attackFrames.push(Assets.images.fighter_green_fighter0026);
			this._attackFrames.push(Assets.images.fighter_green_fighter0027);
			this._attackFrames.push(Assets.images.fighter_green_fighter0028);
			this._attackFrames.push(Assets.images.fighter_green_fighter0029);
			this._attackFrames.push(Assets.images.fighter_green_fighter0030);
		}

		this.bmp.texture = this._idleFrames[0];
		this.bmp.srcRect.set(0, 0, this.bmp.texture.width, this.bmp.texture.height);
		this.bmp.regX = 91;
		this.bmp.regY = 123;
		this.addChild(this.bmp);
	}

	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		super.render(ctx, matrix, alpha);
	}
}
