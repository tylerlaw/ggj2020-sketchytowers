/** @file Bitmap.ts */

class Bitmap extends Sprite
{
	public texture:Texture;
	public srcRect:Rectangle;
	public imageSmoothingEnabled:boolean = true;


	public constructor(texture:Texture = null, sx:number = 0, sy:number = 0, sw:number = texture ? texture.width : 0, sh:number = texture ? texture.height : 0)
	{
		super();
		this.texture = texture;

		this.srcRect = new Rectangle(sx, sy, sw, sh);
	}


	//#region Hit Testing
	/** @inheritdoc */
	public pick(matrix:Matrix2D, globalX:number, globalY:number, mode:PickMode):Sprite
	{
		/*
		let pickedChild:Sprite = super.pick(matrix, globalX, globalY, mode);
		if (pickedChild) return pickedChild;

		if (this.input && !this.input.pointerEnabled) return null;

		matrix.invert().transformVector(this._pt.set(globalX, globalY));

		if (this.input && this.input.hitArea) return (this.input.hitArea.containsVector(this._pt) ? this : null);
		
		if (this.texture)
		{
			if (this._pt.x >= 0 && this._pt.y >= 0 && this._pt.x < this.srcRect.width && this._pt.y < this.srcRect.height) return this;
		}
		*/

		return super.pick(matrix, globalX, globalY, mode);
	}
	//#endregion


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.texture)
		{
			ctx.drawImage(matrix, alpha, this.texture.canvas,
				this.srcRect.x, this.srcRect.y, this.srcRect.width, this.srcRect.height,
				this.texture.x, this.texture.y, this.srcRect.width, this.srcRect.height,
				this.imageSmoothingEnabled
			);
		}

		super.render(ctx, matrix, alpha);
	}
}
