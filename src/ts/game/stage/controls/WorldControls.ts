/** @file WorldControls.ts */

/// <reference path="InputControlArea.ts" />

class WorldControls extends Sprite
{
	public movementArea:InputControlArea;
	public aArea:InputControlArea;
	public bArea:InputControlArea;
	public cArea:InputControlArea;

	public constructor()
	{
		super();

		this.movementArea = new InputControlArea("MOVE", true);
		this.addChild(this.movementArea);

		this.aArea = new InputControlArea("ATTACK");
		this.aArea.relArea.set(0.5, 0, 0.25, 1);
		this.addChild(this.aArea);

		this.bArea = new InputControlArea("LOG / REPAIR");
		this.bArea.relArea.set(0.75, 0, 0.25, 1);
		this.addChild(this.bArea);

		this.cArea = new InputControlArea("build");
		this.cArea.relArea.set(-10.0, -10.0, 0.0, 0.0);
		//this.addChild(this.cArea);

		/*
		this.aArea.input.onPointerPress.add(this.btnChanged, this);
		this.bArea.input.onPointerPress.add(this.btnChanged, this);
		this.cArea.input.onPointerPress.add(this.btnChanged, this);
		this.movementArea.input.onPointerPress.add(this.btnChanged, this);
		this.aArea.input.onPointerRelease.add(this.btnChanged, this);
		this.bArea.input.onPointerRelease.add(this.btnChanged, this);
		this.cArea.input.onPointerRelease.add(this.btnChanged, this);
		this.movementArea.input.onPointerRelease.add(this.btnChanged, this);
		this.aArea.input.onPointerCancel.add(this.btnChanged, this);
		this.bArea.input.onPointerCancel.add(this.btnChanged, this);
		this.cArea.input.onPointerCancel.add(this.btnChanged, this);
		this.movementArea.input.onPointerCancel.add(this.btnChanged, this);
		*/

		this.aArea.onPointerPress.add(this.btnChanged, this);
		this.bArea.onPointerPress.add(this.btnChanged, this);
		this.cArea.onPointerPress.add(this.btnChanged, this);
		this.movementArea.onPointerPress.add(this.btnChanged, this);
		this.aArea.onPointerRelease.add(this.btnChanged, this);
		this.bArea.onPointerRelease.add(this.btnChanged, this);
		//this.cArea.onPointerRelease.add(this.btnChanged, this);
		this.movementArea.onPointerRelease.add(this.btnChanged, this);

	}


	private btnChanged():void
	{
		PlayerClient.controlsChanged(
			this.aArea.isPressed,
			this.bArea.isPressed,
			false, //this.cArea.isPressed,
			this.movementArea.isPressedEnough
		);
	}

	public update(elapsed:number):void
	{
		let lastX:number = this.movementArea.vec.x;
		let lastY:number = this.movementArea.vec.y;
		this.movementArea.update();
		if (lastX !== this.movementArea.vec.x || lastY !== this.movementArea.vec.y)
		{
			//PlayerClient.dirChange(this.movementArea.vec.x, this.movementArea.vec.y);
			PlayerClient.dirChange(this.movementArea.degs, this.movementArea.isPressedEnough);
		}
	}


	public reset():void
	{
		this.movementArea.reset();
		this.aArea.reset();
		this.bArea.reset();
		this.cArea.reset();
		this.btnChanged();
		PlayerClient.dirChange(0, false);
	}

	public disable():void
	{
		this.movementArea.enabled = false;
		this.aArea.enabled = false;
		this.bArea.enabled = false;
		this.cArea.enabled = false;
	}

	public enable():void
	{
		this.movementArea.enabled = true;
		this.aArea.enabled = true;
		this.bArea.enabled = true;
		this.cArea.enabled = true;
	}


	public anchor():void
	{
		this.movementArea.anchor();
		this.aArea.anchor();
		this.bArea.anchor();
		this.cArea.anchor();
	}
}
