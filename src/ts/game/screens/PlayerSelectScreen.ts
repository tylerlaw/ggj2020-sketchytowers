/** @file PlayerSelectScreen.ts */

/// <reference path="../stage/general/StandardButton.ts" />
/// <reference path="../stage/general/Dimmer.ts" />
/// <reference path="../stage/playerSelect/PlayerSelectEntry.ts" />
/// <reference path="../stage/playerSelect/PlayerSelectArrow.ts" />
/// <reference path="PlayerGameplayScreen.ts" />

class PlayerSelectScreen extends GameScreen
{
	private _leaveButton:StandardButton;

	private readonly _hitSprite:Sprite = new Sprite();
	private readonly _tray:Sprite = new Sprite();
	private readonly _entries:PlayerSelectEntry[] = [];

	private readonly _leftArrow:PlayerSelectArrow = new PlayerSelectArrow();
	private readonly _rightArrow:PlayerSelectArrow = new PlayerSelectArrow();
	private readonly _readyButton:StandardButton = new StandardButton(880, 120, "Ready!");
	private readonly _notReadyButton:StandardButton = new StandardButton(880, 120, "Not Ready...");
	private readonly _readyDimmer:Dimmer = new Dimmer();
	

	private _activeIndex:int;

	private _trayPos:number;
	private _isPressed:boolean = false;
	private _isBlocked:boolean = false;

	private _currX:number = 0;
	private _totalMovementX:number = 0;
	private _dragging:boolean = false;
	private _startDragTrayPos:number = 0;

	private _posTween:Interpolator = null;

	private readonly _hitRect:Rectangle = new Rectangle();





	public constructor()
	{
		super();
	}

	protected initialize():void
	{
		this._activeIndex = PlayerClient.playerSlot.job.index;

		this._hitSprite.input = new DisplayInputComponent(this._hitSprite, true, false, this._hitRect);
		this.display.addChild(this._hitSprite);

		let color:PlayerColor = PlayerClient.playerSlot.color;
		for (let i:int = 0; i < PlayerJobs.array.length; ++i)
		{
			let entry:PlayerSelectEntry = new PlayerSelectEntry(i, PlayerJobs.array[i], color);
			this._entries.push(entry);
			this._tray.addChild(entry);
		}
		this.display.addChild(this._tray);

		this._leftArrow.scaleX = -1;
		this._leftArrow.visible = this._activeIndex !== 0;
		this.display.addChild(this._leftArrow);

		this._rightArrow.visible = this._activeIndex !== this._entries.length - 1;
		this.display.addChild(this._rightArrow);

		this.display.addChild(this._readyButton);

		this._leaveButton = new StandardButton(240, 120, "Back");
		this._leaveButton.x = 40;
		this._leaveButton.y = 40;
		this.display.addChild(this._leaveButton);

		this._readyDimmer.visible = false;
		this.display.addChild(this._readyDimmer);

		this.display.addChild(this._notReadyButton);
		this._notReadyButton.visible = false;
		this._notReadyButton.upFill.style = "#990000";
		this._notReadyButton.downFill.style = "#8E0000";
		this._notReadyButton.stroke.style = "#A30000";


		this._hitSprite.input.onPointerPress.add(this.hitSprite_onPress, this);
		PointerInput.primary.onMove.add(this.pointer_onMove, this);
		PointerInput.primary.onCancel.add(this.pointer_onRelease, this);
		PointerInput.primary.onRelease.add(this.pointer_onRelease, this);

		this._leftArrow.input.onPointerClick.add(this.leftArrow_onClick, this);

		this._rightArrow.input.onPointerClick.add(this.rightArrow_onClick, this);

		this._readyButton.input.onPointerClick.add(this.readyButton_onClick, this);

		this._notReadyButton.input.onPointerClick.add(this.notReadyButton_onClick, this);

		this._leaveButton.input.onPointerClick.add(this.leaveButton_onClick, this);

		PlayerClient.onLeaveApproved.add(this.PlayerClient_onLeaveApproved, this);
		PlayerClient.onLeaveDenied.add(this.PlayerClient_onLeaveDenied, this);
		PlayerClient.onNotReadyApproved.add(this.PlayerClient_onNotReadyApproved, this);
		PlayerClient.onStartGame.add(this.PlayerClient_onStartGame, this);


		this._trayPos = (this._activeIndex / PlayerJobs.array.length) + (1 / 4 * 0.25);
		this.anchor();


		this.snap(1.5);


		super.initialize();
	}


	private snap(timeScale:number = 1):void
	{
		if (PlayerClient.playerSlot.job.index !== this._activeIndex)
		{
			PlayerClient.changeJob(this._entries[this._activeIndex].job);
		}

		this._isPressed = false;

		this._leftArrow.visible = this._activeIndex !== 0;
		this._rightArrow.visible = this._activeIndex !== this._entries.length - 1;

		this._posTween = new Interpolator(this._trayPos, this._activeIndex / this._entries.length, 400 * timeScale, 0, Easing.Overshoot.medEaseOut);
	}


	private PlayerClient_onStartGame():void
	{
		PointerInput.primary.onMove.remove(this.pointer_onMove, this);
		PointerInput.primary.onCancel.remove(this.pointer_onRelease, this);
		PointerInput.primary.onRelease.remove(this.pointer_onRelease, this);

		PlayerClient.onLeaveApproved.remove(this.PlayerClient_onLeaveApproved, this);
		PlayerClient.onLeaveDenied.remove(this.PlayerClient_onLeaveDenied, this);
		PlayerClient.onNotReadyApproved.remove(this.PlayerClient_onNotReadyApproved, this);
		PlayerClient.onStartGame.remove(this.PlayerClient_onStartGame, this);

		this.screenManager.add(new PlayerGameplayScreen());
		this.exit();
	}


	private leaveButton_onClick():void
	{
		this.inputEnabled = false;

		PlayerClient.requestLeave();
	}

	private PlayerClient_onLeaveApproved():void
	{
		PointerInput.primary.onMove.remove(this.pointer_onMove, this);
		PointerInput.primary.onCancel.remove(this.pointer_onRelease, this);
		PointerInput.primary.onRelease.remove(this.pointer_onRelease, this);

		PlayerClient.onLeaveApproved.remove(this.PlayerClient_onLeaveApproved, this);
		PlayerClient.onLeaveDenied.remove(this.PlayerClient_onLeaveDenied, this);
		PlayerClient.onNotReadyApproved.remove(this.PlayerClient_onNotReadyApproved, this);
		PlayerClient.onStartGame.remove(this.PlayerClient_onStartGame, this);

		this.screenManager.add(new TitleScreen(TeamTowerDefense.instance.isPlayerClient, TeamTowerDefense.instance.isLocalTest));
		this.exit();
	}

	private PlayerClient_onLeaveDenied():void
	{
		this.inputEnabled = true;
	}


	private notReadyButton_onClick():void
	{
		PlayerClient.requestNotReady();
	}

	private PlayerClient_onNotReadyApproved():void
	{
		this._isBlocked = false;
		this._readyButton.visible = true;
		this._leftArrow.visible = this._activeIndex > 0;
		this._rightArrow.visible = this._activeIndex < this._entries.length - 1;
		this._readyDimmer.visible = false;
		this._notReadyButton.visible = false;
		this._leaveButton.visible = true;
	}


	private readyButton_onClick():void
	{
		this._isBlocked = true;

		this._readyButton.visible = false;
		this._leftArrow.visible = false;
		this._rightArrow.visible = false;
		this._readyDimmer.visible = true;
		this._notReadyButton.visible = true;
		this._leaveButton.visible = false;

		PlayerClient.ready();
	}


	private leftArrow_onClick():void
	{
		if (this._activeIndex > 0)
		{
			this._activeIndex--;
			this.snap();
		}
	}

	private rightArrow_onClick():void
	{
		if (this._activeIndex < this._entries.length - 1)
		{
			this._activeIndex++;
			this.snap();
		}
	}


	private hitSprite_onPress():void
	{
		if (this._isPressed) return;
		if (this._isBlocked) return;
		this._isPressed = true;

		this._currX = PointerInput.primary.x / Stage.scale;
		this._totalMovementX = 0;
		this._dragging = false;
	}

	private pointer_onMove():void
	{
		if (!this._isPressed) return;

		let xNow:number = PointerInput.primary.x / Stage.scale;
		let trayWidth:number = Stage.width * this._entries.length;

		if (!this._dragging)
		{
			this._totalMovementX += Math.abs(xNow - this._currX);

			if (this._totalMovementX / Stage.width >= 0.03)
			{
				this._dragging = true;
				this._startDragTrayPos = this._trayPos;
			}
		}

		let deltaX:number = xNow - this._currX;
		this._currX = xNow;

		if (this._dragging)
		{
			let trayX:number = trayWidth * -this._trayPos;
			trayX += deltaX;
			if (trayX > 30) trayX = 30;
			if (trayX < -(trayWidth - Stage.width + 30)) trayX = -(trayWidth - Stage.width + 30);

			this._trayPos = trayX / (PlayerJobs.array.length * -Stage.width);
			//this._trayPos -= deltaX / (Stage.width);

			let ttlDeltaPos:number = this._trayPos - this._startDragTrayPos;
			if (Math.abs(ttlDeltaPos) > (1 / 4) * 0.1)
			{
				if (ttlDeltaPos > 0)
				{
					if (this._activeIndex < this._entries.length - 1)
					{
						this._activeIndex++;
						this.snap();
					}
				}
				else
				{
					if (this._activeIndex > 0)
					{
						this._activeIndex--;
						this.snap();
					}
				}
			}
		}
	}

	private pointer_onRelease():void
	{
		if (!this._isPressed) return;
		this._isPressed = false;

		if (!this._posTween) this.snap();
	}



	private anchor():void
	{
		for (let entry of this._entries) entry.anchor();

		this._hitRect.set(0, 0, Stage.width, Stage.height);

		this._tray.x = (-Stage.width * this._entries.length) * this._trayPos;

		this._leftArrow.x = 30;
		this._rightArrow.x = Stage.width - 30;
		this._leftArrow.y = this._rightArrow.y = Stage.height / 2;

		this._readyButton.x = Stage.width / 2 + 40;
		this._readyButton.y = Stage.height / 2 + 488 / 2 + 40;

		this._notReadyButton.x = Stage.width / 2 + 40;
		this._notReadyButton.y = Stage.height / 2 + 488 / 2 + 40;
	}

	public update(elapsed:number):void
	{
		if (this._activeIndex !== 1)
		{
			this._readyButton.visible = false;
		}
		else
		{
			this._readyButton.visible = true;
		}

		if (this._posTween && !this._isPressed)
		{
			this._trayPos = this._posTween.update(elapsed);
			if (this._posTween.isFinished) this._posTween = null;
		}

		this.anchor();

		super.update(elapsed);
	}
}
