/** @file main.ts */

/// <reference path="game/TeamTowerDefense.ts" />

navigator.vibrate = (navigator.vibrate ||
					(<any>navigator).webkitVibrate ||
					(<any>navigator).mozVibrate ||
					(<any>navigator).msVibrate);

function main():void
{
	AssetManager.onProgress.add(function():void
	{
		//console.log(AssetManager.progress);
	}, null);

	AssetManager.onLoaded.add(function():void
	{
		//console.log("loaded");
		setTimeout(function():void
		{
			//console.log(Assets);

			new TeamTowerDefense((<any>window).isPlayerClient, (<any>window).isLocalTest).start();

		}, 100);
	}, null);

	AssetManager.load();
}

setTimeout(main, 100);
