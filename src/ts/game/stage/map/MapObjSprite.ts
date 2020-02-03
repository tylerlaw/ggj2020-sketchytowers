/** @file MapObjSprite.ts */

interface MapObjDisplayObject extends Sprite
{
	readonly sortIndex:int;
}

class MapObjSprite extends Sprite implements MapObjDisplayObject
{
	public readonly sortIndex:int;

	public constructor()
	{
		super();
		this.sortIndex = Map.sortIndex++;
	}
}

class MapObjBmp extends Bitmap implements MapObjDisplayObject
{
	public readonly sortIndex:int;

	public constructor(texture:Texture = null, sx:number = 0, sy:number = 0, sw:number = texture ? texture.width : 0, sh:number = texture ? texture.height : 0)
	{
		super(texture, sx, sy, sw, sh);
		this.sortIndex = Map.sortIndex++;
	}
}
