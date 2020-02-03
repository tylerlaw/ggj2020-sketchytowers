/** @file InputControlArea.ts */

class InputControlArea extends Sprite
{
	public onPointerPress:DelegateEvent<Handler> = new DelegateEvent();
	public onPointerRelease:DelegateEvent<Handler> = new DelegateEvent();

	public upFill:FillSettings = null;
	public upFillAlpha:number = 0;
	public upStroke:StrokeSettings = new StrokeSettings("#FFFFFF", 10);
	public upStrokeAlpha:number = 0.3;
	public downFill:FillSettings = null;
	public downStroke:StrokeSettings = new StrokeSettings("#FFFFFF", 10);
	public downStrokeAlpha:number = 0.5;
	public downFillAlpha:number = 0.1;
	public relArea:Rectangle = new Rectangle(0, 0, 0.5, 1);
	public radius:number = 20;

	public lbl:TextField = new TextField("lbl", new TextSettings(Assets.fonts.OpenSans_Bold, 40, TextAlign.Center, TextBaseline.Middle), new FillSettings("#FFFFFF"));

	public isRotational:boolean;

	private readonly _hitRect:Rectangle = new Rectangle();
	private readonly _renderRect:Rectangle = new Rectangle();

	private readonly _downPoint:Vector2 = new Vector2();
	private readonly _currPoint:Vector2 = new Vector2();
	public readonly vec:Vector2 = new Vector2();
	public degs:number = 0;


	public enabled:boolean = true;

	public isPressed:boolean = false;
	private downPointer:Pointer = null;


	public get isPressedEnough():boolean
	{
		return this.isPressed && this.vec.lengthSquared() > 0;
	}

	public id:string;


	public reset():void
	{
		this._downPoint.set(0, 0);
		this._currPoint.set(0, 0);
		this.vec.set(0, 0);
		this.degs = 0;
		this.isPressed = false;
		this.downPointer = null;
	}


	public constructor(id:string, isRotational:boolean = false)
	{
		super();

		this.addChild(this.lbl);
		this.lbl.text = id;

		this.id = id;
		this.isRotational = isRotational;

		//this.input.hitArea = this._hitRect;

		//this.input.onPointerPress.add(this.input_onPointerPress, this);

		let c:number = 0;
		for (let pointer of PointerInput.pointers)
		{
			pointer.onPress.add(this.pointer_onPress, this);
			pointer.onRelease.add(this.pointer_onRelease, this);
			pointer.onCancel.add(this.pointer_onRelease, this);
			c++;
		}

		/*

		The first pointer down on this area is the assigned pointer

		*/

		this.anchor();
	}


	public anchor():void
	{
		let titleSafeHeight:number = 44 / Stage.scale * GameWindow.pixelRatio;

		let availHeight:number = Stage.height - titleSafeHeight;

		this._hitRect.set(
			this.relArea.x * Stage.width,
			this.relArea.y * availHeight + titleSafeHeight,
			this.relArea.width * Stage.width,
			this.relArea.height * availHeight
		);

		this._renderRect.set(
			this.relArea.x * Stage.width + 30,
			this.relArea.y * availHeight + 30 + titleSafeHeight,
			this.relArea.width * Stage.width - 60,
			this.relArea.height * availHeight - 60
		);

		this.lbl.x = this._hitRect.x + this._hitRect.width / 2;
		this.lbl.y = this._hitRect.y + this._hitRect.height / 2;
	}

	private input_onPointerPress():void
	{
		let xNow:number = PointerInput.primary.x / Stage.scale;
		let yNow:number = PointerInput.primary.y / Stage.scale;
		this._downPoint.set(xNow, yNow);
		this._currPoint.set(xNow, yNow);
		this.vec.set(0, 0);
	}


	private pointer_onPress(pointer:Pointer):void
	{
		if (this.enabled)
		{
			if (!this.isPressed)
			{
				let xNow:number = pointer.x / Stage.scale;
				let yNow:number = pointer.y / Stage.scale;
				if (this._hitRect.containsVector(new Vector2(xNow, yNow)))
				{
					this.downPointer = pointer;
					this.isPressed = true;
					this._downPoint.set(xNow, yNow);
					this._currPoint.set(xNow, yNow);
					this.vec.set(0, 0);
					this.onPointerPress.invoke();
				}
			}
		}
	}

	private pointer_onRelease(pointer:Pointer):void
	{
		if (this.enabled)
		{
			if (this.isPressed && this.downPointer === pointer)
			{
				this.isPressed = false;
				this.downPointer = null;
				this.onPointerRelease.invoke();
			}
		}
	}


	public update():void
	{
		if (this.isPressed)
		{
			//let xNow:number = PointerInput.primary.x / Stage.scale;
			//let yNow:number = PointerInput.primary.y / Stage.scale;

			let xNow:number = this.downPointer.x / Stage.scale;
			let yNow:number = this.downPointer.y / Stage.scale;
			this._currPoint.set(xNow, yNow);

			if (this.isRotational)
			{
				this.vec.set(xNow - this._downPoint.x, yNow - this._downPoint.y);
				if (this.vec.length() > 0.1 * Stage.height)
				{
					let rads:number = Math.atan2(this.vec.y, this.vec.x);
					let degs:number = MathUtil.RAD_TO_DEG * rads;
					degs = Math.round(degs);
					if (degs % 2 === 1) degs -= 1;
					//rads = MathUtil.DEG_TO_RAD * degs;
					this.vec.set(
						MathUtil.cosDegrees(degs),
						MathUtil.sinDegrees(degs)
					);
					this.degs = degs;
				}
				else
				{
					this.vec.set(0, 0);
					this.degs = 0;
				}
			}
		}
		else
		{
			this.vec.set(0, 0);
			this.degs = 0;
		}
	}


	public render(ctx:GraphicsContext, matrix:Matrix2D, alpha:number):void
	{
		if (this.isPressed)
		{
			ctx.drawRoundedRect(matrix, alpha * this.downFillAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, this.downFill);
			ctx.drawRoundedRect(matrix, alpha * this.downStrokeAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, null, this.downStroke);
		}
		else
		{
			ctx.drawRoundedRect(matrix, alpha * this.upFillAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, this.upFill);
			ctx.drawRoundedRect(matrix, alpha * this.upStrokeAlpha, this._renderRect.x, this._renderRect.y, this._renderRect.width, this._renderRect.height, this.radius, this.radius, this.radius, this.radius, null, this.upStroke);
		}

		super.render(ctx, matrix, alpha);
	}
}
