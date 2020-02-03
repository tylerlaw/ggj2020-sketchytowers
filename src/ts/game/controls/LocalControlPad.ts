/** @file LocalControlPad.ts */

class LocalControlPad extends ControlPad
{
	public constructor()
	{
		super(0);
		ControlPad.array[0] = this;
	}

	public poll():void
	{
		this.attackButton.justPressed = false;
		this.interactButton.justPressed = false;
		this.buildButton.justPressed = false;
		this.stick.justPressed = false;

		this.attackButton.justReleased = false;
		this.interactButton.justReleased = false;
		this.buildButton.justReleased = false;
		this.stick.justReleased = false;

		if (Keyboard.keys.Space.isPressed)
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

		if (Keyboard.keys.Enter.isPressed)
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

		if (Keyboard.keys.B.isPressed)
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

		let v:Vector2 = this.stick.vector.set(0, 0);
		if (Keyboard.keys.Left.isPressed) v.x--;
		if (Keyboard.keys.Right.isPressed) v.x++;
		if (Keyboard.keys.Up.isPressed) v.y--;
		if (Keyboard.keys.Down.isPressed) v.y++;
		if (v.lengthSquared() > 0)
		{
			v.normalize();

			if (!this.stick.isPressed)
			{
				this.stick.isPressed = true;
				this.stick.justPressed = true;
			}
		}
		else
		{
			if (this.stick.isPressed)
			{
				this.stick.isPressed = false;
				this.stick.justReleased = true;
			}
		}

	}
}
