/** @file GameWindow.ts */

// tslint:disable-next-line: typedef
const GameWindow = new (class
{
	public readonly onResized:DelegateEvent<Handler> = new DelegateEvent();

	public element:HTMLDivElement = null;
	public width:number = 1;
	public height:number = 1;
	public pixelRatio:number = 1;
	private _dirty:boolean = true;

	public constructor()
	{
		this.window_resize = this.window_resize.bind(this);
	}

	public initialize():void
	{
		window.addEventListener("resize", this.window_resize);

		this.element = <HTMLDivElement>document.getElementById("game");

		this.beginFrame();
	}

	public beginFrame():void
	{
		if (this._dirty)
		{
			this._dirty = false;

			const rect:ClientRect = this.element.getBoundingClientRect();	// causes a dom reflow, use sparingly
			const pixelRatio:number = window.devicePixelRatio ? window.devicePixelRatio : ((<any>screen).deviceXDPI && (<any>screen).logicalXDPI ? (<any>screen).deviceXDPI / (<any>screen).logicalXDPI : 1);

			const resized:boolean = this.width !== rect.width || this.height !== rect.height || this.pixelRatio !== pixelRatio;

			if (resized)
			{
				this.width = rect.width;
				this.height = rect.height;
				this.pixelRatio = pixelRatio;
				this.onResized.invoke();
			}
		}
	}

	private window_resize():void
	{
		this._dirty = true;
	}

})();
