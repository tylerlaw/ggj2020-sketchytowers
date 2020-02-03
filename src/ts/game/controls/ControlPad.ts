/** @file ControlPad.ts */

/// <reference path="ControlPadButton.ts" />
/// <reference path="ControlPadStick.ts" />

class ControlPad
{
	public static readonly array:ControlPad[] = [
		new ControlPad(0),
		new ControlPad(1),
		new ControlPad(2),
		new ControlPad(3)
	];


	public readonly index:int;
	public readonly attackButton:ControlPadButton;
	public readonly interactButton:ControlPadButton;
	public readonly buildButton:ControlPadButton;
	public readonly stick:ControlPadStick;

	public constructor(index:int)
	{
		this.index = index;
		this.attackButton = new ControlPadButton();
		this.interactButton = new ControlPadButton();
		this.buildButton = new ControlPadButton();
		this.stick = new ControlPadStick();
	}

	public update(degs:number, move:boolean, attack:boolean, interact:boolean, build:boolean):void
	{
		this.attackButton.justPressed = this.attackButton.justReleased = false;
		this.interactButton.justPressed = this.interactButton.justReleased = false;
		this.buildButton.justPressed = this.buildButton.justReleased = false;
		this.stick.justPressed = this.stick.justReleased = false;

		this.stick.vector.x = MathUtil.cosDegrees(degs);
		this.stick.vector.y = MathUtil.sinDegrees(degs);

		if (move)
		{
			if (!this.stick.isPressed)
			{
				this.stick.isPressed = true;
				this.stick.justPressed = true;
			}
		}
		else
		{
			this.stick.vector.set(0, 0);

			if (this.stick.isPressed)
			{
				this.stick.isPressed = false;
				this.stick.justReleased = true;
			}
		}

		if (build)
		{
			if (!this.buildButton.isPressed)
			{
				this.buildButton.isPressed = true;
				this.buildButton.justPressed = true;
			}
		}
		else
		{
			if (this.buildButton.isPressed)
			{
				this.buildButton.isPressed = false;
				this.buildButton.justReleased = true;
			}
		}

		if (interact)
		{
			if (!this.interactButton.isPressed)
			{
				this.interactButton.isPressed = true;
				this.interactButton.justPressed = true;
			}
		}
		else
		{
			if (this.interactButton.isPressed)
			{
				this.interactButton.isPressed = false;
				this.interactButton.justReleased = true;
			}
		}

		if (attack)
		{
			if (!this.attackButton.isPressed)
			{
				this.attackButton.isPressed = true;
				this.attackButton.justPressed = true;
			}
		}
		else
		{
			if (this.attackButton.isPressed)
			{
				this.attackButton.isPressed = false;
				this.attackButton.justReleased = true;
			}
		}
	}
}
