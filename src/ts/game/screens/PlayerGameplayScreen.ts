/** @file PlayerGameplayScreen.ts */

/// <reference path="../stage/controls/WorldControls.ts" />

class PlayerGameplayScreen extends GameScreen
{
	/*
	Send Update when a button is pressed or released
	Send periodic updates with direction vector when pressed and different
	*/


	public worldControls:WorldControls;


	public constructor()
	{
		super();
	}

	protected initialize():void
	{
		this.worldControls = new WorldControls();
		this.display.addChild(this.worldControls);


		PlayerClient.onEnterLoggingMinigame.add(this.PlayerClient_onEnterLoggingMinigame, this);
		PlayerClient.onEnterBuildingMinigame.add(this.PlayerClient_onEnterBuildingMinigame, this);


		this.anchor();

		super.initialize();
	}

	protected removed():void
	{
		PlayerClient.onEnterLoggingMinigame.remove(this.PlayerClient_onEnterLoggingMinigame, this);
		PlayerClient.onEnterBuildingMinigame.remove(this.PlayerClient_onEnterBuildingMinigame, this);
		super.removed();
	}


	private PlayerClient_onEnterLoggingMinigame(health:number):void
	{
		this.screenManager.add(new MinigameLoggingScreen(health));
	}

	private PlayerClient_onEnterBuildingMinigame(health:number):void
	{
		this.screenManager.add(new MinigameBuildingScreen(health));
	}

	protected loseFocus():void
	{
		this.worldControls.reset();
		this.worldControls.disable();
		super.loseFocus();
	}

	protected gainFocus():void
	{
		this.worldControls.reset();
		this.worldControls.enable();
		super.gainFocus();
	}


	private anchor():void
	{
		this.worldControls.anchor();
	}

	public update(elapsed:number):void
	{
		this.worldControls.update(elapsed);

		this.anchor();
	}
}
