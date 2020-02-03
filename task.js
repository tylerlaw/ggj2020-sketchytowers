//#region Build Support
class Task
{
	/**
	 * 
	 * @param {Function} fn 
	 * @param {string} name 
	 * @param {string} desc 
	 */
	constructor(fn, name, desc)
	{
		this.fn = fn;
		this.name = name;
		this.desc = desc
	}
}

class AssetManifest
{
	constructor()
	{
		/** @type {Object.<string, Asset>} */
		this.images = {},

		/** @type {Object.<string, Asset>} */
		this.sounds = {},

		/** @type {Object.<string, Asset>} */
		this.fonts = {}
	}
}

const AssetType = {
	Image: 0,
	Sound: 1,
	Font: 2
};

class Asset
{
	/**
	 * 
	 * @param {string} src 
	 * @param {string} path 
	 * @param {number} type 
	 * @param {AssetManifest} manifest 
	 */
	constructor(src, path, type, manifest)
	{
		this.path = path.replace("bin/game/", "");

		let id = path.replace("bin/game/images/", "");
		id = id.replace("bin/game/sounds/", "");
		id = id.replace("bin/game/fonts/", "");
		while (id.indexOf(".png") > 0) id = id.replace(".png", "");
		while (id.indexOf(".mp3") > 0) id = id.replace(".mp3", "");
		while (id.indexOf(".ttf") > 0) id = id.replace(".ttf", "");
		while (id.indexOf(" ") > 0) id = id.replace(" ", "_");
		while (id.indexOf("-") > 0) id = id.replace("-", "_");
		while (id.indexOf("/") > 0) id = id.replace("/", "_");

		let arr = manifest.images;
		if (type === AssetType.Sound) arr = manifest.sounds;
		else if (type === AssetType.Font) arr = manifest.fonts;

		if (arr[id])
		{
			console.log("ASSET NAMING CONFLICT!");
			process.exit(1);
		}
		arr[id] = this.path;

		this.id = id;
	}
}

/** @type {Task[]} */
const tasks = [];
//#endregion


//#region Tasks
function assets()
{
	const fs = require("fs");
	const glob = require("glob");
	const FontBuilder = require("./builder/FontBuilder");

	let manifest = new AssetManifest();

	if (!fs.existsSync("bin")) fs.mkdirSync("bin");
	if (!fs.existsSync("bin/game")) fs.mkdirSync("bin/game");
	if (!fs.existsSync("bin/game/images")) fs.mkdirSync("bin/game/images");
	if (!fs.existsSync("bin/game/sounds")) fs.mkdirSync("bin/game/sounds");
	if (!fs.existsSync("bin/game/fonts")) fs.mkdirSync("bin/game/fonts");

	/** @type {string[]} */
	let imageFiles = glob.sync("src/assets/images/**/*.png");
	for (let file of imageFiles)
	{
		let dest = file.replace("src/assets", "bin/game");

		let dirs = dest.split("/");
		dirs.pop();
		let dirPath = "";
		for (let dir of  dirs)
		{
			if (dir === "") continue;

			if (dirPath !== "") dirPath += "/";
			dirPath += dir;
			if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
		}

		fs.copyFileSync(file, dest);
		new Asset(file, dest, AssetType.Image, manifest);
	}

	/** @type {string[]} */
	let soundFiles = glob.sync("src/assets/sounds/**/*.mp3");
	for (let file of soundFiles)
	{
		let dest = file.replace("src/assets", "bin/game");

		let dirs = dest.split("/");
		dirs.pop();
		let dirPath = "";
		for (let dir of  dirs)
		{
			if (dir === "") continue;

			if (dirPath !== "") dirPath += "/";
			dirPath += dir;
			if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
		}

		fs.copyFileSync(file, dest);
		new Asset(file, dest, AssetType.Sound, manifest);
	}

	/** @type {string[]} */
	let fontList = JSON.parse(fs.readFileSync("src/assets/fonts/fonts.json", "utf-8"));
	let fonts = [];
	for (let fontEntry of fontList)
	{
		let file = fontEntry.src;
		let dest = file.replace("src/assets", "bin/game");

		let dirs = dest.split("/");
		dirs.pop();
		let dirPath = "";
		for (let dir of  dirs)
		{
			if (dir === "") continue;

			if (dirPath !== "") dirPath += "/";
			dirPath += dir;
			if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
		}

		fs.copyFileSync(file, dest);
		let asset = new Asset(file, dest, AssetType.Font, manifest);

		let bytes = fs.readFileSync(file).buffer;
		let ttf = new FontBuilder.TTF(bytes);
		
		let font = {
			asset: asset,
			family: fontEntry.family,
			weight: fontEntry.weight,
			style: fontEntry.style,
			variant: fontEntry.variant,
			ascent: ttf.ascent,
			descent: ttf.descent,
			unitsPerEm: ttf.unitsPerEm
		};
		fonts.push(font);
	}

	let out = "/** @file Assets.generated.ts */\n\n// tslint:disable\nconst Assets = new (class\n{\n";

	let json = JSON.stringify(manifest, undefined, "\t");
	while (json.indexOf("\t\"") > 0) json = json.replace("\t\"", "\t");
	while (json.indexOf("\":") > 0) json = json.replace("\":", ":");
	json = "public manifest = " + json;
	let lines = json.split("\n");
	for (let i = 0; i < lines.length; ++i)
	{
		lines[i] = "\t" + lines[i];
	}
	json = lines.join("\n") + ";\n";
	out += json + "\n";

	let imagesOut = "";
	let imagesCount = 0;
	for (let id in manifest.images)
	{
		if (imagesCount > 0) imagesOut += ",\n";
		imagesOut += "\t\t" + id + ":Texture";
		imagesCount++;
	}
	if (imagesCount > 0) out += "\tpublic images:{\n" + imagesOut + "\n\t} = <any>{};\n\n";

	let soundsOut = "";
	let soundsCount = 0;
	for (let id in manifest.sounds)
	{
		if (soundsCount > 0) soundsOut += ",\n";
		soundsOut += "\t\t" + id + ":SoundData";
		soundsCount++;
	}
	if (soundsCount > 0) out += "\tpublic sounds:{\n" + soundsOut + "\n\t} = <any>{};\n\n";

	let fontsOut = "";
	let fontsCount = 0;
	for (let font of fonts)
	{
		if (fontsCount > 0) fontsOut += ",\n";
		fontsOut += "\t\t" + font.asset.id + ": new Font(\"" + font.family + "\", \"" + font.weight + "\", \"" + font.style + "\", \"" + font.variant + "\", " + font.ascent + ", " + font.descent + ", " + font.unitsPerEm + ")";
		fontsCount++;
	}
	if (fontsCount > 0) out += "\tpublic fonts = {\n" + fontsOut + "\n\t};\n\n";

	out += "})();\n// tslint:enable\n";


	fs.writeFileSync("src/assets/Assets.generated.ts", out);
}
tasks.push(new Task(assets, "assets", "Updates the games asset manifest"));

function build()
{
	assets(true);

	const fs = require("fs");
	const exec = require("child_process");
	const tsc = "node_modules/typescript/bin/tsc";

	let args = " -p tsconfig.json";
	let result = exec.spawnSync("node", [tsc + args], { shell: true, cwd: process.cwd(), env: process.env, stdio: "pipe", encoding: "utf-8" });
	if (result.status > 0)
	{
		console.log("Transpile Failed:");
		if (result.stdout) console.log(result.stdout);
		if (result.stderr) console.log(result.stderr);
		process.exit(1);
	}
	if (result.stdout !== "")
	{
		if (result.stdout.charAt(result.stdout.length - 1) === "\n") result.stdout = result.stdout.substr(0, result.stdout.length - 1);	// Remove extra new line
		console.log("Transpile Output:");
		console.log(result.stdout);
	}

	fs.copyFileSync("src/html/screen.html", "bin/game/screen.html");
	fs.copyFileSync("src/html/local-screen.html", "bin/game/local-screen.html");
	fs.copyFileSync("src/html/controller.html", "bin/game/controller.html");
	fs.copyFileSync("src/html/local-controller.html", "bin/game/local-controller.html");

	process.exit(0);
}
tasks.push(new Task(build, "build", "Updates the games asset manifest and builds a debug version of the game"));



function serve()
{
	const exec = require("child_process");

	process.chdir("./bin/");
	
	if (process.platform === "win32")
	{
		let child = exec.spawn("npx", ["http-server", "-c-1"], { shell: true, detached: true, stdio: ["ignore", "ignore", "ignore"], windowsHide: true } );
		child.unref();
	}
	else
	{
		/*
		let result = exec.spawnSync("npx", ["http-server", "-c-1 -p 8080"], { shell: true, detached: false, stdio: "pipe", encoding: "utf-8" } );
		if (result.status > 0)
		{
			console.log("Failed:");
			if (result.stdout) console.log(result.stdout);
			if (result.stderr) console.log(result.stderr);
			process.exit(1);
		}
		if (result.stdout !== "")
		{
			if (result.stdout.charAt(result.stdout.length - 1) === "\n") result.stdout = result.stdout.substr(0, result.stdout.length - 1);	// Remove extra new line
			console.log("Output:");
			console.log(result.stdout);
		}
		*/

		let child = exec.spawn("npx", ["http-server", "-c-1 -p 8080"], { shell: true, detached: false, } );
		child.stdout.on('data', function(data) {
			console.log(data.toString()); 
		});
		child.stderr.on('data', function(data) {
			console.log(data.toString()); 
		});
	}
}
tasks.push(new Task(serve, "serve", "Begins serving the game on http://localhost:8080"));
//#endregion



//#region Entry Point
(function()
{
	const name = process.argv.length > 2 ? process.argv[2] : "";
	const args = process.argv.length > 3 ? process.argv.slice(3) : [];

	/** @type {Task} */
	let task;
	for (let tmp of tasks)
	{
		if (tmp.name === name)
		{
			task = tmp;
			break;
		}
	}

	if (task)
	{
		task.fn();
	}
	else
	{
		console.warn("Unknown Task: \"" + name + "\"");
		let msg = "Try one of:";
		for (let tmp of tasks)
		{
			msg += "\n   node task " + tmp.name + " - " + tmp.desc;
		}
		console.log(msg);
	}
})();
//#endregion
