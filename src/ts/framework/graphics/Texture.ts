/** @file Texture.ts */

class Texture
{
	/** Gets the canvas being rendered to the screen. Only created if a renderer is requested. Use sparingly. @internal */
	public canvas:HTMLCanvasElement;

	/** The width of the texture. @readonly */
	public width:int;

	/** The height of the texture. @readonly */
	public height:int;

	/** The textures x registration point. */
	public x:int = 0;

	/** The textures y registration point. */
	public y:int = 0;


	public constructor(src:CanvasImageSource)
	{
		this.canvas = document.createElement("canvas");
		this.width = this.canvas.width = <number>src.width;
		this.height = this.canvas.height = <number>src.height;
		let ctx:CanvasRenderingContext2D = this.canvas.getContext("2d");
		ctx.drawImage(src, 0, 0);
	}
}
