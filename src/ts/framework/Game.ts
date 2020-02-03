/** @file Game.ts */

/// <reference path="lang/lang.ts" />
/// <reference path="lang/delegate/DelegateEvent.ts" />
/// <reference path="system/System.ts" />
/// <reference path="app/App.ts" />
/// <reference path="font/Font.ts" />
/// <reference path="GameWindow.ts" />
/// <reference path="stage/Stage.ts" />
/// <reference path="screen/GameScreenManager.ts" />
/// <reference path="assets/AssetManager.ts" />
/// <reference path="sound/SoundManager.ts" />
/// <reference path="input/keyboard/Keyboard.ts" />
/// <reference path="math/interpolation/Interpolator.ts" />
/// <reference path="physics/Collider.ts" />

/**
 * Base game class
 */
abstract class Game
{
	private _lastTick:number;

	


	protected constructor()
	{
		this.tick = this.tick.bind(this);

		App.initialize();
	}

	public start():void
	{
		this._lastTick = Date.now();
		this.tick();
	}

	private tick():void
	{
		let now:number = Date.now();
		let elapsed:number = now - this._lastTick;
		this._lastTick = now;
		if (elapsed > (1000 / 60) * 3) elapsed = (1000 / 60) * 3;

		// Update
		this.update(elapsed);
		this.draw();

		// Begin Frame
		GameWindow.beginFrame();
		Stage.beginFrame();

		// Draw
		Stage.render();

		// Tick
		requestAnimationFrame(this.tick);
	}

	protected abstract update(elapsed:number):void;

	protected abstract draw():void;
}
