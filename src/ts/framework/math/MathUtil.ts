/** @file MathUtil.ts */

/**
 * Holds various Math utilities.
 */
// tslint:disable-next-line: typedef
const MathUtil = new (class
{
	//#region Constants
	/** The constant used to convert degrees to radians. */
	public readonly DEG_TO_RAD:number = Math.PI / 180;

	/** The constant used to convert degrees to radians. */
	public readonly RAD_TO_DEG:number = 180 / Math.PI;

	/** The constant used for 360 degress (2 pi). */
	public readonly TWO_PI:number = Math.PI * 2;
	//#endregion


	//#region Members
	/** Lookup table for computing the cos value of a degree. */
	private readonly _lutCosDegrees:number[] = [];

	/** Lookup table for computing the sin value of a degree. */
	private readonly _lutSinDegrees:number[] = [];
	//#endregion


	//#region Constructor
	/**
	 * Creates a new MathUtil.
	 */
	public constructor()
	{
		// Compute look up tables
		/*
		for (let i:number = 0; i < 360 * 4; ++i)
		{
			this._lutCosDegrees[i] = Math.cos(this.DEG_TO_RAD * i / 4);
			this._lutSinDegrees[i] = Math.sin(this.DEG_TO_RAD * i / 4);
		}
		*/
		this._lutCosDegrees.length =
		this._lutSinDegrees.length = 3600;
		for (let i:number = 0; i < 3600; ++i)
		{
			this._lutCosDegrees[i] = Math.cos(this.DEG_TO_RAD * i / 10);
			this._lutSinDegrees[i] = Math.sin(this.DEG_TO_RAD * i / 10);
		}
	}
	//#endregion


	//#region Numbers
	/**
	 * Checks if a number is a power of 2.
	 * @param value The number to check.
	 * @returns True if value is a power of 2.
	 */
	public isPowerOf2(value:number):boolean
	{
		return (value & (value - 1)) === 0;
	}
	//#endregion


	//#region Geometry
	/**
	 * Uses a precomputed lookup table instead of Math.cos();
	 * @param d The degree value to find the cos of 
	 * @returns Math.cos(degrees) accurate to 1/10 of a degree.
	 */
	public cosDegrees(d:number):number
	{
		// accurate to 1/4 degree
		/*
		degrees *= 4;

		degrees = (degrees + (degrees >= 0 ? 0.5 : -0.5)) << 0;	// round
		degrees = degrees % (360 * 4);							// truncate to 360
		if (degrees < 0) degrees += (360 * 4);					// make positive by wrapping
		*/

		d *= 10;
		d = (d + (d >= 0 ? 0.5 : -0.5)) << 0;
		d = d % 3600;
		d = d === -0 ? 0 : d;
		d = d >= 0 ? d : d + 3600;
		
		return this._lutCosDegrees[d];
	}

	/**
	 * Uses a precomputed lookup table instead of Math.sin();
	 * @param d The degree value to find the sin of 
	 * @returns Math.sin(degrees) accurate to 1/10 of a degree.
	 */
	public sinDegrees(d:number):number
	{
		// accurate to 1/4 degree
		/*
		degrees *= 4;

		degrees = (degrees + (degrees >= 0 ? 0.5 : -0.5)) << 0;	// round
		degrees = degrees % (360 * 4);							// truncate to 360
		if (degrees < 0) degrees += (360 * 4);					// make positive by wrapping
		*/

		d *= 10;
		d = (d + (d >= 0 ? 0.5 : -0.5)) << 0;
		d = d % 3600;
		d = d === -0 ? 0 : d;
		d = d >= 0 ? d : d + 3600;

		return this._lutSinDegrees[d];
	}
	//#endregion
})();
