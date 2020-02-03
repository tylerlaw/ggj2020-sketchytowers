/** @file KeyboardKeySet.ts */

/// <reference path="KeyboardKey.ts" />

/**
 * Static collection of all keyboard keys.
 */
interface KeyboardKeySet
{
	//#region Keys
	/* tslint:disable:completed-docs */
	readonly A:KeyboardKey;				// = new KeyboardKey(65, ["A", "a"], this);
	readonly B:KeyboardKey;				// = new KeyboardKey(66, ["B", "b"], this);
	readonly C:KeyboardKey;				// = new KeyboardKey(67, ["C", "c"], this);
	readonly D:KeyboardKey;				// = new KeyboardKey(68, ["D", "d"], this);
	readonly E:KeyboardKey;				// = new KeyboardKey(69, ["E", "e"], this);
	readonly F:KeyboardKey;				// = new KeyboardKey(70, ["F", "f"], this);
	readonly G:KeyboardKey;				// = new KeyboardKey(71, ["G", "g"], this);
	readonly H:KeyboardKey;				// = new KeyboardKey(72, ["H", "h"], this);
	readonly I:KeyboardKey;				// = new KeyboardKey(73, ["I", "i"], this);
	readonly J:KeyboardKey;				// = new KeyboardKey(74, ["J", "j"], this);
	readonly K:KeyboardKey;				// = new KeyboardKey(75, ["K", "k"], this);
	readonly L:KeyboardKey;				// = new KeyboardKey(76, ["L", "l"], this);
	readonly M:KeyboardKey;				// = new KeyboardKey(77, ["M", "m"], this);
	readonly N:KeyboardKey;				// = new KeyboardKey(78, ["N", "n"], this);
	readonly O:KeyboardKey;				// = new KeyboardKey(79, ["O", "o"], this);
	readonly P:KeyboardKey;				// = new KeyboardKey(80, ["P", "p"], this);
	readonly Q:KeyboardKey;				// = new KeyboardKey(81, ["Q", "q"], this);
	readonly R:KeyboardKey;				// = new KeyboardKey(82, ["R", "r"], this);
	readonly S:KeyboardKey;				// = new KeyboardKey(83, ["S", "s"], this);
	readonly T:KeyboardKey;				// = new KeyboardKey(84, ["T", "t"], this);
	readonly U:KeyboardKey;				// = new KeyboardKey(85, ["U", "u"], this);
	readonly V:KeyboardKey;				// = new KeyboardKey(86, ["V", "v"], this);
	readonly W:KeyboardKey;				// = new KeyboardKey(87, ["W", "w"], this);
	readonly X:KeyboardKey;				// = new KeyboardKey(88, ["X", "x"], this);
	readonly Y:KeyboardKey;				// = new KeyboardKey(89, ["Y", "y"], this);
	readonly Z:KeyboardKey;				// = new KeyboardKey(90, ["Z", "z"], this);

	readonly Num0:KeyboardKey;			// = new KeyboardKey(96, ["0"], this);
	readonly Num1:KeyboardKey;			// = new KeyboardKey(97, ["1"], this);
	readonly Num2:KeyboardKey;			// = new KeyboardKey(98, ["2"], this);
	readonly Num3:KeyboardKey;			// = new KeyboardKey(99, ["3"], this);
	readonly Num4:KeyboardKey;			// = new KeyboardKey(100, ["4"], this);
	readonly Num5:KeyboardKey;			// = new KeyboardKey(101, ["5"], this);
	readonly Num6:KeyboardKey;			// = new KeyboardKey(102, ["6"], this);
	readonly Num7:KeyboardKey;			// = new KeyboardKey(103, ["7"], this);
	readonly Num8:KeyboardKey;			// = new KeyboardKey(104, ["8"], this);
	readonly Num9:KeyboardKey;			// = new KeyboardKey(105, ["9"], this);

	readonly Tab:KeyboardKey;			// = new KeyboardKey(9, ["Tab"], this);

	/** Escape Key - BEWARE using this, it cannot be prevented. IF in fullscreen, it will exit fullscreen. */
	readonly Escape:KeyboardKey;		// = new KeyboardKey(27, ["Escape", "Esc"], this);
	readonly Backspace:KeyboardKey;		// = new KeyboardKey(8, ["Backspace"], this);
	readonly Delete:KeyboardKey;		// = new KeyboardKey(46, ["Delete"], this);
	readonly Space:KeyboardKey;			// = new KeyboardKey(32, ["Space", " "], this);
	readonly Tilde:KeyboardKey;			// = new KeyboardKey(192, ["`", "~"], this);

	readonly Left:KeyboardKey;			// = new KeyboardKey(37, ["ArrowLeft"], this);
	readonly Up:KeyboardKey;			// = new KeyboardKey(38, ["ArrowUp"], this);
	readonly Right:KeyboardKey;			// = new KeyboardKey(39, ["ArrowRight"], this);
	readonly Down:KeyboardKey;			// = new KeyboardKey(40, ["ArrowDown"], this);

	readonly Enter:KeyboardKey;			// = new KeyboardKey(13, ["Enter"], this);

	readonly PageUp:KeyboardKey;			// = new KeyboardKey(33, ["PageUp"], this);
	readonly PageDown:KeyboardKey;			// = new KeyboardKey(34, ["PageDown"], this);
	readonly End:KeyboardKey;			// = new KeyboardKey(35, ["End"], this);
	readonly Home:KeyboardKey;			// = new KeyboardKey(36, ["Home"], this);
	readonly CapsLock:KeyboardKey;			// = new KeyboardKey(20, ["CapsLock"], this);
	readonly Ctrl:KeyboardKey;			// = new KeyboardKey(17, ["Control"], this);
	readonly Alt:KeyboardKey;			// = new KeyboardKey(18, ["Alt"], this);

	readonly Shift:KeyboardKey;			// = new KeyboardKey(16, ["Shift"], this);

	readonly OS:KeyboardKey;			// = new KeyboardKey(91, ["OS"], this);				// Windows key

	readonly Backslash:KeyboardKey;		// = new KeyboardKey(220, ["\\", "|"], this);

	//readonly F11:KeyboardKey;			// = new KeyboardKey(122, ["F11"], this);			// Reserved for toggling fullscreen
	/* tslint:enable:completed-docs */
	//#endregion
}
