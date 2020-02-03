/** @file Waves.ts */

class $Waves
{
	public current:int = 0;

	public spawn(map:Map):number
	{
		console.log("   spawning", this.current);

		let baseSpawnDelay:number = 1000;
		let baseNumMonster:number = 4;
		let postWaveDelay:number = 10000;

		let initialDelay:number = 7000;

		if (this.current === 0)
		{
			initialDelay = 10000;
		}

		//initialDelay = 0;

		let spawnDuration:number = 6000;

		let spawnDelay:number = baseSpawnDelay;
		for (let i:int = 0; i < this.current; ++i) spawnDelay *= 0.9;
		

		let numMonsters:number = 4 + this.current * 4;

		//let spawnDelay:number = spawnDuration / numMonsters;

		for (let i:int = 0; i < numMonsters; ++i)
		{
			let grunt:GruntSprite = new GruntSprite(map, map.monsterSpawns[Math.floor(Math.random() * map.monsterSpawns.length)]);
			map.monsterSprites.push(grunt);
			//let randPos:Vector2 = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
			//grunt.x = randPos.x;
			///grunt.y = randPos.y;
			map.objectLayer.addChild(grunt);


			grunt.spawnDelay = initialDelay + spawnDelay * i;

			map.effectSprites.push(grunt.healthBar);
			map.upperEffectsLayer.addChild(grunt.healthBar);

			console.log("   spawn");
		}



		this.current++;

		return postWaveDelay;
	}
}

const Waves:$Waves = new $Waves();
