/** @file Easing.ts */

/**
 * Defines the interface for an easing function
 */
interface EasingFunction
{
	/**
	 * @param t "Time" The current time.
	 * @param b "Begin" The start value.
	 * @param c "Change" The start value.
	 * @param d "Duration" The duration to ease over.
	 * @return number The value at time t.
	 */
	(t:number, b:number, c:number, d:number):number;
}

namespace Easing
{
	/** PI * 2 */
	const PI_M2:number = Math.PI * 2;

	/** Default Linear interpolation function. */
	export function none(t:number, b:number, c:number, d:number):number { return c * t / d + b; }
	
	export namespace Quadratic
	{
		/** Quadratic ease in. */
		export function easeIn(t:number, b:number, c:number, d:number):number { return c * (t /= d) * t + b; }

		/** Quadratic ease out. */
		export function easeOut(t:number, b:number, c:number, d:number):number { return -c * (t /= d) * (t - 2) + b; }
		
		/** Quadratic ease in and out. */
		export function easeInOut(t:number, b:number, c:number, d:number):number { return (/* tslint:disable */ (t /= d / 2) /* tslint:enable */ < 1) ? (c / 2 * t * t + b) : (-c / 2 * ((--t) * (t - 2) - 1) + b); }
	}
	
	export namespace Overshoot
	{
		/** A soft overshoot ease. */
		function soft(t:number, b:number, c:number, d:number, part1:EasingFunction, part2:EasingFunction):number
		{
			let overshoot:number = c * 0.025;

			let t1:number = t;
			let b1:number = b;
			let c1:number = c + overshoot;
			let d1:number = d * 0.7;

			let t2:number = t - d1;
			let b2:number = b + c + overshoot;
			let c2:number = -overshoot;
			let d2:number = d - d1;

			if (t <= d1) return part1(t1, b1, c1, d1);
			else return part2(t2, b2, c2, d2);
		}

		/** A medium overshoot ease. */
		function med(t:number, b:number, c:number, d:number, part1:EasingFunction, part2:EasingFunction):number
		{
			let overshoot:number = c * 0.05;

			let t1:number = t;
			let b1:number = b;
			let c1:number = c + overshoot;
			let d1:number = d * 0.7;

			let t2:number = t - d1;
			let b2:number = b + c + overshoot;
			let c2:number = -overshoot;
			let d2:number = d - d1;

			if (t <= d1) return part1(t1, b1, c1, d1);
			else return part2(t2, b2, c2, d2);
		}

		/** A soft overshoot ease. */
		export function softEaseOut(t:number, b:number, c:number, d:number):number
		{
			return soft(t, b, c, d, Quadratic.easeOut, Easing.none);
		}

		/** A medium overshoot ease. */
		export function medEaseOut(t:number, b:number, c:number, d:number):number
		{
			return med(t, b, c, d, Quadratic.easeOut, Easing.none);
		}

		/** A soft overshoot ease. */
		export function softEaseInOut(t:number, b:number, c:number, d:number):number
		{
			return soft(t, b, c, d, Quadratic.easeIn, Quadratic.easeOut);
		}
	}

	export namespace Rock
	{
		/** Rocks back and forth starting from a fully rocked position. */
		export function easeOut(t:number, b:number, c:number, d:number):number
		{
			let dp:number = d / 7;
			let s:number;
			let e:number;

			if (t <= dp)
			{
				// -2 --> 0
				return Quadratic.easeIn(
					t,
					b,							// -2
					c,							// -2 + 2 = 0
					dp
				);
			}
			else if (t <= dp * 2)
			{
				// 0 --> 1
				return Quadratic.easeOut(
					t - dp,
					b + c,						// -2 + 2 = 0
					c * 0.5,					// 0 + (2 * 0.5) = 1
					dp
				);
			}
			else if (t <= dp * 3)
			{
				// 1 --> 0
				return Quadratic.easeIn(
					t - dp * 2,
					b + c * 1.5,				// -2 + 2 * 1.5 = -2 + 3 = 1
					-c / 2,						// 1 + -2 / 2 = 1 + -1 = 0
					dp
				);
			}
			else if (t <= dp * 4)
			{
				// 0 --> -0.5
				return Quadratic.easeOut(
					t - dp * 3,
					b + c,						// -2 + 2 = 0
					-c / 4,						// 0 + -2 / 4 = -2 / 4 = -0.5
					dp
				);
			}
			else if (t <= dp * 5)
			{
				// -0.5 --> 0
				return Quadratic.easeIn(
					t - dp * 4,
					b + c * 0.75,				// -0.5
					c / 4,						// -0.5 + 2 / 4 = -0.5 + 0.5 = 0
					dp
				);
			}
			else if (t <= dp * 6)
			{
				// 0 --> 0.25
				return Quadratic.easeOut(
					t - dp * 5,
					b + c,						// -2 + 2 = 0
					c / 8,						// 0 + 2 / 8 = 0.25
					dp
				);
			}
			else
			{
				// 0.25 --> 0
				return Quadratic.easeIn(
					t - dp * 6,
					b + c * 1.125,				// -2 + 2 * 1.125 = 0.25
					-c / 8,
					dp
				);
			}
		}
	}
}
