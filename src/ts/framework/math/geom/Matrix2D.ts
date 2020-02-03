/** @file Matrix2D.ts */

/// <reference path="../MathUtil.ts" />
/// <reference path="Vector2.ts" />

/**
 * A 2 dimensional matrix suited for graphics transformations.
 */
class Matrix2D
{
	//#region Static Members
	/** A helper matrix, this shouldn't be needed eventually after optimizations. */
	private static readonly _helper:Matrix2D = new Matrix2D();
	//#endregion


	//#region Members
	/** The a (m11) component. The value that affects the positioning of pixels along the x axis when scaling or rotating an image. */
	public a:number;

	/** The b (m12) component. The value that affects the positioning of pixels along the y axis when rotating or skewing an image. */
	public b:number;

	/** The c (m21) component. The value that affects the positioning of pixels along the x axis when rotating or skewing an image. */
	public c:number;

	/** The d (m22) component. The value that affects the positioning of pixels along the y axis when scaling or rotating an image. */
	public d:number;

	/** The e (dx) component. The distance by which to translate each point along the x axis. */
	public tx:number;

	/** The f (dy) component. The distance by which to translate each point along the y axis. */
	public ty:number;

	/** Returns true if this matrix is currently the identity. */
	public get isIdentity():boolean { return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0; }
	//#endregion


	//#region Constructor
	/**
	 * Creates a new Matrix object with the specified parameters. Default params will set to identity.
	 * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
	 * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
	 * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
	 * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
	 * @param tx The distance by which to translate each point along the x axis.
	 * @param ty The distance by which to translate each point along the y axis.
	 */
	public constructor(a:number = 1, b:number = 0, c:number = 0, d:number = 1, tx:number = 0, ty:number = 0)
	{
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.tx = tx;
		this.ty = ty;
	}
	//#endregion

	
	//#region Setting
	/**
	 * Manually sets each component of the matrix.
	 * @returns this matrix.
	 */
	public set(a:number, b:number, c:number, d:number, tx:number, ty:number):Matrix2D
	{
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.tx = tx;
		this.ty = ty;

		return this;
	}

	/**
	 * Copies the values of one matrix to this matrix.
	 * @param m The matrix to copy.
	 * @returns this matrix.
	 */
	public copy(m:Matrix2D):Matrix2D
	{
		this.a = m.a;
		this.b = m.b;
		this.c = m.c;
		this.d = m.d;
		this.tx = m.tx;
		this.ty = m.ty;

		return this;
	}

	public concat(m:Matrix2D, x:number, y:number, scaleX:number, scaleY:number, rotation:number, skewX:number, skewY:number, regX:number, regY:number):Matrix2D
	{
		this.a = m.a;
		this.b = m.b;
		this.c = m.c;
		this.d = m.d;
		this.tx = m.tx;
		this.ty = m.ty;


		let cos:number, sin:number;

		if (rotation % 360)
		{
			//var r:number = rotation * MathUtil.DEG_TO_RAD;
			//var cos:number = Math.cos(r);
			//var sin:number = Math.sin(r);

			cos = MathUtil.cosDegrees(rotation);
			sin = MathUtil.sinDegrees(rotation);
		}
		else
		{
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY)
		{
			//skewX *= MathUtil.DEG_TO_RAD;
			//skewY *= MathUtil.DEG_TO_RAD;
			//this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			//this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);

			// TODO: FUTURE- can this be combined into a single append operation?
			// TODO: FUTURE- after combining the operations, it should be inlined.
			this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
		}
		else
		{
			// TODO: FUTURE- inline, this is a major perf drag
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
		}
		
		if (regX || regY)
		{
			// append the registration offset
			this.tx -= regX * this.a + regY * this.c;
			this.ty -= regX * this.b + regY * this.d;
		}

		return this;
	}

	/**
	 * Sets to an identity matrix.
	 * @returns this matrix.
	 */
	public identity():Matrix2D
	{
		this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;

		return this;
	}

	/**
	 * Sets the values of this matrix as specified by the transform properties supplied.
	 * @param x The x position.
	 * @param y The y position.
	 * @param scaleX The x scale.
	 * @param scaleY The y scale.
	 * @param rotation The rotation in degrees.
	 * @param skewX	The x skew.
	 * @param skewY The y skew.
	 * @param regX The x registration point to transform around.
	 * @param regY The y registration point to transform around.
	 * @returns This matrix.
	 */
	public setTransform(x:number, y:number, scaleX:number, scaleY:number, rotation:number, skewX:number, skewY:number, regX:number, regY:number):Matrix2D
	{
		this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;

		let cos:number, sin:number;

		if (rotation % 360)
		{
			//var r:number = rotation * MathUtil.DEG_TO_RAD;
			//var cos:number = Math.cos(r);
			//var sin:number = Math.sin(r);

			cos = MathUtil.cosDegrees(rotation);
			sin = MathUtil.sinDegrees(rotation);
		}
		else
		{
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY)
		{
			//skewX *= MathUtil.DEG_TO_RAD;
			//skewY *= MathUtil.DEG_TO_RAD;
			//this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			//this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);

			// TODO: FUTURE- can this be combined into a single append operation?
			// TODO: FUTURE- after combining the operations, it should be inlined.
			this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
		}
		else
		{
			// TODO: FUTURE- Inline
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);	// TODO: FUTURE- this is a major drag
		}
		
		if (regX || regY)
		{
			// append the registration offset:
			this.tx -= regX * this.a + regY * this.c;
			this.ty -= regX * this.b + regY * this.d;
		}

		return this;
	}
	//#endregion


	//#region Math
	/**
	 * Inverts the matrix.
	 * @returns This matrix, now inverted.
	 */
	public invert():Matrix2D
	{
		/* // Orig code
		var a1:number = this.a;
		var b1:number = this.b;
		var c1:number = this.c;
		var d1:number = this.d;
		var tx1:number = this.tx;
		var n:number = a1 * d1 - b1 * c1;

		this.a = d1 / n;
		this.b = -b1 / n;
		this.c = -c1 / n;
		this.d = a1 / n;
		this.tx = (c1 * this.ty - d1 * tx1) / n;
		this.ty = -(a1 * this.ty - b1 * tx1) / n;
		*/

		// Opt code
		const a1:number = this.a;				// req
		const tx1:number = this.tx;			// req
		const n:number = a1 * this.d - this.b * this.c;

		this.tx = (this.c * this.ty - this.d * tx1) / n;
		this.ty = -(this.a * this.ty - this.b * tx1) / n;

		this.a = this.d / n;
		this.b = -this.b / n;
		this.c = -this.c / n;
		this.d = a1 / n;

		return this;
	}

	/**
	 * Appends a matrix as specified by the supplied components to this matrix.
	 * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
	 * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
	 * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
	 * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
	 * @param tx The distance by which to translate each point along the x axis.
	 * @param ty The distance by which to translate each point along the y axis.
	 * @returns This matrix.
	 */
	public append(a:number, b:number, c:number, d:number, tx:number, ty:number):Matrix2D
	{
		const a1:number = this.a;
		const b1:number = this.b;
		const c1:number = this.c;
		const d1:number = this.d;

		if (a !== 1 || b !== 0 || c !== 0 || d !== 1)
		{
			this.a  = a1 * a + c1 * b;
			this.b  = b1 * a + d1 * b;
			this.c  = a1 * c + c1 * d;
			this.d  = b1 * c + d1 * d;
		}
		this.tx = a1 * tx + c1 * ty + this.tx;
		this.ty = b1 * tx + d1 * ty + this.ty;

		return this;
	}

	/**
	 * Appends the specified matrix to this matrix.
	 * @param m The matrix to append.
	 * @returns This matrix.
	 */
	public appendMatrix(m:Matrix2D):Matrix2D
	{
		const a1:number = this.a;
		const b1:number = this.b;
		const c1:number = this.c;
		const d1:number = this.d;

		if (m.a !== 1 || m.b !== 0 || m.c !== 0 || m.d !== 1)
		{
			this.a  = a1 * m.a + c1 * m.b;
			this.b  = b1 * m.a + d1 * m.b;
			this.c  = a1 * m.c + c1 * m.d;
			this.d  = b1 * m.c + d1 * m.d;
		}
		this.tx = a1 * m.tx + c1 * m.ty + this.tx;
		this.ty = b1 * m.tx + d1 * m.ty + this.ty;

		return this;
	}

	/**
	 * Appends a matrix as specified by the transform properties supplied.
	 * @param x The x position.
	 * @param y The y position.
	 * @param scaleX The x scale.
	 * @param scaleY The y scale.
	 * @param rotation The rotation in degrees.
	 * @param skewX	The x skew.
	 * @param skewY The y skew.
	 * @param regX The x registration point to transform around.
	 * @param regY The y registration point to transform around.
	 * @returns This matrix.
	 */
	public appendTransform(x:number, y:number, scaleX:number, scaleY:number, rotation:number, skewX:number, skewY:number, regX:number, regY:number):Matrix2D
	{
		let cos:number, sin:number;

		if (rotation % 360)
		{
			//var r:number = rotation * MathUtil.DEG_TO_RAD;
			//var cos:number = Math.cos(r);
			//var sin:number = Math.sin(r);

			cos = MathUtil.cosDegrees(rotation);
			sin = MathUtil.sinDegrees(rotation);
		}
		else
		{
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY)
		{
			//skewX *= MathUtil.DEG_TO_RAD;
			//skewY *= MathUtil.DEG_TO_RAD;
			//this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			//this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);

			// TODO: FUTURE- can this be combined into a single append operation?
			// TODO: FUTURE- after combining the operations, it should be inlined.
			this.append(MathUtil.cosDegrees(skewY), MathUtil.sinDegrees(skewY), -MathUtil.sinDegrees(skewX), MathUtil.cosDegrees(skewX), x, y);
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
		}
		else
		{
			// TODO: FUTURE- inline, this is a major perf drag
			this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
		}
		
		if (regX || regY)
		{
			// append the registration offset
			this.tx -= regX * this.a + regY * this.c;
			this.ty -= regX * this.b + regY * this.d;
		}

		return this;
	}

	/**
	 * Prepends a matrix as specified by the supplied components to this matrix.
	 * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
	 * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
	 * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
	 * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
	 * @param tx The distance by which to translate each point along the x axis.
	 * @param ty The distance by which to translate each point along the y axis.
	 * @returns This matrix.
	 */
	public prepend(a:number, b:number, c:number, d:number, tx:number, ty:number):Matrix2D
	{
		const a1:number = this.a;
		const c1:number = this.c;
		const tx1:number = this.tx;

		this.a  = a * a1 + c * this.b;
		this.b  = b * a1 + d * this.b;
		this.c  = a * c1 + c * this.d;
		this.d  = b * c1 + d * this.d;
		this.tx = a * tx1 + c * this.ty + tx;
		this.ty = b * tx1 + d * this.ty + ty;

		return this;
	}

	/**
	 * Prepends the specified matrix to this matrix.
	 * @param m The matrix to append.
	 * @returns This matrix.
	 */
	public prependMatrix(m:Matrix2D):Matrix2D
	{
		const a1:number = this.a;
		const c1:number = this.c;
		const tx1:number = this.tx;

		this.a  = m.a * a1 + m.c * this.b;
		this.b  = m.b * a1 + m.d * this.b;
		this.c  = m.a * c1 + m.c * this.d;
		this.d  = m.b * c1 + m.d * this.d;
		this.tx = m.a * tx1 + m.c * this.ty + m.tx;
		this.ty = m.b * tx1 + m.d * this.ty + m.ty;

		return this;
	}

	/**
	 * Prepends a matrix as specified by the transform properties supplied.
	 * @param x The x position.
	 * @param y The y position.
	 * @param scaleX The x scale.
	 * @param scaleY The y scale.
	 * @param rotation The rotation in degrees.
	 * @param skewX	The x skew.
	 * @param skewY The y skew.
	 * @param regX The x registration point to transform around.
	 * @param regY The y registration point to transform around.
	 * @returns This matrix.
	 */
	public prependTransform(x:number, y:number, scaleX:number, scaleY:number, rotation:number, skewX:number, skewY:number, regX:number, regY:number):Matrix2D
	{
		// TODO: FUTURE- optimize / inline
		const m:Matrix2D = Matrix2D._helper.setTransform(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY);
		return this.prepend(m.a, m.b, m.c, m.d, m.tx, m.ty);
	}
	//#endregion


	//#region Vectors
	/**
	 * Transforms a point according to this matrix.
	 * Deforms the vector and returns it.
	 * @param v The vector to transform.
	 * @returns The same vector, transformed.
	 */
	public transformVector(v:Vector2):Vector2
	{
		const x:number = v.x;
		const y:number = v.y;

		v.x = x * this.a + y * this.c + this.tx;
		v.y = x * this.b + y * this.d + this.ty;
		
		return v;
	}
	//#endregion
	

	//#region Cloning
	/**
	 * Returns a new matrix with the same values as this matrix.
	 * @returns a new matrix with the same values as this matrix.
	 */
	public clone():Matrix2D
	{
		return new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
	}
	//#endregion


	//#region Equatable
	/**
	 * Returns true if the specied matrix's components match this one's.
	 * @param m The matrix to compare.
	 * @returns true if the specied matrix's components match this one's.
	 */
	public equals(m:Matrix2D):boolean
	{
		return m.a === this.a && m.b === this.b && m.c === this.c && m.d === this.d && m.tx === this.tx && m.ty === this.ty;
	}
	//#endregion


	//#region String
	/**
	 * Returns a human readable string of this object.
	 * @returns a human readable string of this object.
	 */
	public toString():string
	{
		return "[Matrix2D (a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]";
	}
	//#endregion
}
