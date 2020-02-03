/** @file GraphicsContext.ts */

/// <reference path="../math/geom/Matrix2D.ts" />
/// <reference path="Texture.ts" />
/// <reference path="support/color/Color.ts" />
/// <reference path="support/fill/FillSettings.ts" />
/// <reference path="support/stroke/StrokeSettings.ts" />
/// <reference path="support/text/TextSettings.ts" />

class GraphicsContext
{
	public readonly canvas:HTMLCanvasElement;
	public readonly ctx:CanvasRenderingContext2D;
	public width:number;
	public height:number;
	public matrix:Matrix2D = new Matrix2D();
	public alpha:number = 1;
	public readonly text:TextSettings = new TextSettings(null);
	public readonly fill:FillSettings = new FillSettings();
	public readonly stroke:StrokeSettings = new StrokeSettings();
	private _fontStr:string;
	public fillStyleOverride:FillStyle = null;
	public strokeStyleOverride:StrokeStyle = null;
	public imageSmoothingEnabled:boolean = true;

	private readonly imageSmoothingEnabledProp:string;


	public constructor(canvas:HTMLCanvasElement)
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;

		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.globalAlpha = 1;

		if (this.ctx.imageSmoothingEnabled !== undefined) this.imageSmoothingEnabledProp = "imageSmoothingEnabled";
		else if ((<any>this.ctx).msImageSmoothingEnabled !== undefined) this.imageSmoothingEnabledProp = "msImageSmoothingEnabled";
		else if ((<any>this.ctx).mozImageSmoothingEnabled !== undefined) this.imageSmoothingEnabledProp = "mozImageSmoothingEnabled";
		else if ((<any>this.ctx).webkitImageSmoothingEnabled !== undefined) this.imageSmoothingEnabledProp = "webkitImageSmoothingEnabled";
		else if ((<any>this.ctx).oImageSmoothingEnabled !== undefined) this.imageSmoothingEnabledProp = "oImageSmoothingEnabled";
		
		// tslint:disable-next-line: no-console
		if (!this.imageSmoothingEnabledProp) console.warn("Image smoothing control is not available");
		// tslint:disable-next-line: no-console
		else if (this.imageSmoothingEnabledProp !== "imageSmoothingEnabled") console.info("Using polyfill image smoothing control: " + this.imageSmoothingEnabledProp);

		this.clear(false);
	}

	public resize(width:number, height:number):void
	{
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.clear(false);
	}

	public clear(clearPixels:boolean):void
	{
		if (clearPixels)
		{
			if (!this.matrix.isIdentity) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.ctx.clearRect(0, 0, this.width, this.height);
		}
		else
		{
			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		this.matrix.identity();

		if (this.imageSmoothingEnabledProp)
		{
			this.imageSmoothingEnabled = (<any>this.ctx)[this.imageSmoothingEnabledProp];
		}
		else
		{
			this.imageSmoothingEnabled = true;
		}

		this.alpha = this.ctx.globalAlpha;

		this.fill.style = this.ctx.fillStyle || null;

		this.stroke.style = this.ctx.strokeStyle || null;
		this.stroke.width = this.ctx.lineWidth;
		this.stroke.cap = <any>this.ctx.lineCap || null;
		this.stroke.dash = this.ctx.getLineDash() || [];
		this.stroke.dashOffset = this.ctx.lineDashOffset;
		this.stroke.join = <any>this.ctx.lineJoin || null;
		this.stroke.miter = this.ctx.miterLimit;
		this.stroke.underFill = false;

		this._fontStr = this.ctx.font;							// has size and face built into it
		this.text.align = <TextAlign>this.ctx.textAlign || null;

		// Text baseline must always be set to alphabetic
		let textBaseline:CanvasTextBaseline = this.ctx.textBaseline;
		if (textBaseline !== "alphabetic")
		{
			this.ctx.textBaseline = "alphabetic";
		}
	}

	private apply(matrix:Matrix2D, alpha:number, text:TextSettings, fill:FillSettings, stroke:StrokeSettings, imageSmoothingEnabled:boolean):void
	{
		// Apply matrix
		if (!this.matrix.equals(matrix))
		{
			this.matrix.copy(matrix);
			this.ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		}

		// Apply alpha
		if (this.alpha !== alpha)
		{
			this.ctx.globalAlpha = this.alpha = alpha;
		}

		if (this.imageSmoothingEnabled !== imageSmoothingEnabled)
		{
			if (this.imageSmoothingEnabledProp)
			{
				(<any>this.ctx)[this.imageSmoothingEnabledProp] = imageSmoothingEnabled;
			}
			this.imageSmoothingEnabled = imageSmoothingEnabled;
		}

		// Apply font
		if (text)
		{
			let nextFontStr:string = "";		// see https://developer.mozilla.org/en-US/docs/Web/CSS/font
			if (text.font.style) nextFontStr += text.font.style + " ";
			if (text.font.variant) nextFontStr += text.font.variant + " ";
			if (text.font.weight) nextFontStr += text.font.weight + " ";
			nextFontStr += text.size + "px ";
			nextFontStr += text.font.family;

			if (this._fontStr !== nextFontStr)
			{
				this.text.font = text.font;
				this.text.size = text.size;

				this.ctx.font = this._fontStr = nextFontStr;
			}
			if (this.text.align !== text.align)
			{
				this.ctx.textAlign = this.text.align = text.align;
			}
			if (this.text.baseline !== text.baseline)
			{
				this.text.baseline = text.baseline;
				// No need to change state here, baseline is handled by the renderer
			}
		}

		// Apply fill
		if (fill)
		{
			let fillStyle:FillStyle = this.fillStyleOverride !== null ? this.fillStyleOverride : fill.style;
			if (this.fill.style !== fillStyle)
			{
				this.ctx.fillStyle = this.fill.style = fillStyle;
			}
		}

		// Apply stroke
		if (stroke)
		{
			if (this.stroke.cap !== stroke.cap)
			{
				this.ctx.lineCap = this.stroke.cap = stroke.cap;
			}
			
			if (stroke.dash.length > 0 || this.stroke.dash.length > 0)	// if has stroke, or no stroke currently have stroke set
			{
				let diff:boolean = false;
				if (stroke.dash.length !== this.stroke.dash.length)
				{
					diff = true;
				}
				else
				{
					for (let i:int = 0; i < stroke.dash.length; ++i)
					{
						if (stroke.dash[i] !== this.stroke.dash[i])
						{
							diff = true;
							break;
						}
					}
				}

				if (diff)
				{
					this.stroke.dash = stroke.dash.slice(0);
					this.ctx.setLineDash(this.stroke.dash);
				}
			}

			if (this.stroke.dashOffset !== stroke.dashOffset)
			{
				this.ctx.lineDashOffset = this.stroke.dashOffset = stroke.dashOffset;
			}

			if (this.stroke.join !== stroke.join)
			{
				this.ctx.lineJoin = this.stroke.join = stroke.join;
			}

			if (this.stroke.miter !== stroke.miter)
			{
				this.ctx.miterLimit = this.stroke.miter = stroke.miter;
			}

			let strokeStyle:StrokeStyle = this.strokeStyleOverride !== null ? this.strokeStyleOverride : stroke.style;
			if (this.stroke.style !== strokeStyle)
			{
				this.ctx.strokeStyle = this.stroke.style = strokeStyle;
			}

			if (this.stroke.width !== stroke.width)
			{
				this.ctx.lineWidth = this.stroke.width = stroke.width;
			}
		}
	}

	public applyTextSettings(text:TextSettings):void
	{
		// Apply font
		if (text)
		{
			let nextFontStr:string = "";		// see https://developer.mozilla.org/en-US/docs/Web/CSS/font
			if (text.font.style) nextFontStr += text.font.style + " ";
			if (text.font.variant) nextFontStr += text.font.variant + " ";
			if (text.font.weight) nextFontStr += text.font.weight + " ";
			nextFontStr += text.size + "px ";
			nextFontStr += text.font.family;

			if (this._fontStr !== nextFontStr)
			{
				this.text.font = text.font;
				this.text.size = text.size;

				this.ctx.font = this._fontStr = nextFontStr;
			}
			if (this.text.align !== text.align)
			{
				this.ctx.textAlign = this.text.align = text.align;
			}
			if (this.text.baseline !== text.baseline)
			{
				this.text.baseline = text.baseline;
				// No need to change state here, baseline is handled by the renderer
			}
		}
	}

	//#region Text Measuring
	/**
	 * Measures the given string using the given text settings.
	 * @param str The string to measure.
	 * @param text The text settings to measure with.
	 */
	public measureText(str:string, text:TextSettings):TextMetrics
	{
		this.applyTextSettings(text);

		return this.ctx.measureText(str);
	}
	//#endregion

	/**
	 * Draws a CanvasImageSource from the specified src rect in the img to the destination rect supplied.
	 * @param matrix The transformation matrix to set.
	 * @param alpha The global alpha to set.
	 * @param img The img to draw.
	 * @param sX The src rectangle x.
	 * @param sY The src rectangle y.
	 * @param sW The src rectangle w.
	 * @param sH The src rectangle h.
	 * @param dX The dest rectangle x.
	 * @param dY The dest rectangle y.
	 * @param dW The dest rectangle w.
	 * @param dH The dest rectangle h.
	 */
	public drawImage(matrix:Matrix2D, alpha:number, img:CanvasImageSource, sX:number, sY:number,  sW:number, sH:number, dX:number, dY:number, dW:number, dH:number, imageSmoothingEnabled:boolean = true):void
	{
		if (sW === 0 || sH === 0 || dW === 0 || dH === 0 || !img || alpha === 0) return; // nothing to draw

		this.apply(matrix, alpha, null, null, null, imageSmoothingEnabled);

		this.ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
	}

	/**
	 * Draws the supplied string at the given location with the supplied fill and/or stroke and shadow.
	 * If you don't supply a stroke or a fill, nothing will be rendered.
	 * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param x An additional x transformation to draw with.
	 * @param y An additional y transformation to draw with.
	 * @param str The string to draw.
	 * @param text The font settings to use.
	 * @param fill The fill settings to use. Supply null for no fill.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawText(matrix:Matrix2D, alpha:number, x:number, y:number, str:string, text:TextSettings, fill?:FillSettings, stroke?:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (!str || str === "" || !text || (!fill && !stroke)) return;	// nothing to draw

		this.apply(matrix, alpha, text, fill, stroke, imageSmoothingEnabled);

		// Offset for baseline
		if (this.text.font.metrics)
		{
			if (this.text.baseline === TextBaseline.Top)
			{
				y += this.text.font.metrics.ascent / this.text.font.metrics.unitsPerEm * this.text.size;
			}
			else if (this.text.baseline === TextBaseline.Alphabetic)
			{
				y += 0;
			}
			else if (this.text.baseline === TextBaseline.Bottom)
			{
				y += this.text.font.metrics.descent / this.text.font.metrics.unitsPerEm * this.text.size;
			}
			else if (this.text.baseline === TextBaseline.Middle)
			{
				let top:number = this.text.font.metrics.ascent / this.text.font.metrics.unitsPerEm * this.text.size;
				let bottom:number = this.text.font.metrics.descent / this.text.font.metrics.unitsPerEm * this.text.size;
				y += (top + bottom) / 2;
			}
			else
			{
				throw new Error("Text Baseline " + this.text.baseline + " is not yet supported!");
			}
		}

		if (stroke && stroke.underFill)
		{
			this.ctx.strokeText(str, x, y);
		}
		
		if (fill)
		{
			this.ctx.fillText(str, x, y);
		}

		if (stroke && !stroke.underFill)
		{
			this.ctx.strokeText(str, x, y);
		}
	}

	/**
	 * Draws a rectangle of the supplied size with the supplied fill and/or stroke.
	 * If you don't supply a stroke or a fill, nothing will be rendered.
	 * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param x An additional x transformation to draw with.
	 * @param y An additional y transformation to draw with.
	 * @param w The width to draw.
	 * @param h The height ot draw.
	 * @param fill The fill settings to use. Supply null for no fill.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawRect(matrix:Matrix2D, alpha:number, x:number, y:number, w:number, h:number, fill?:FillSettings, stroke?:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (w === 0 || h === 0 || (!fill && !stroke)) return; // nothing to draw

		this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);

		if (stroke && stroke.underFill)
		{
			this.ctx.strokeRect(x, y, w, h);
		}
		
		if (fill)
		{
			this.ctx.fillRect(x, y, w, h);
		}

		if (stroke && !stroke.underFill)
		{
			this.ctx.strokeRect(x, y, w, h);
		}
	}

	/**
	 * Draws an a line.
	 * If you don't supply a stroke, nothing will be rendered.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param x x of starting point.
	 * @param y y of starting point.
	 * @param x2 x of ending point.
	 * @param y2 y of ending point.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawLine(matrix:Matrix2D, alpha:number, x:number, y:number, x2:number, y2:number, stroke?:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (!stroke) return; // nothing to draw

		this.apply(matrix, alpha, null, null, stroke, imageSmoothingEnabled);

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(x2, y2);

		this.ctx.stroke();
	}

	

	/**
	 * Draws a rectangle of the supplied size with the supplied fill and/or stroke and shadow.
	 * If you don't supply a stroke or a fill, nothing will be rendered.
	 * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param x An additional x transformation to draw with.
	 * @param y An additional y transformation to draw with.
	 * @param w The width to draw.
	 * @param h The height ot draw.
	 * @param rtl The top left radius in pixels.
	 * @param rtr The top right radius in pixels.
	 * @param rbr The bottom right radius in pixels.
	 * @param rbl The bottom left radius in pixels.
	 * @param fill The fill settings to use. Supply null for no fill.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawRoundedRect(matrix:Matrix2D, alpha:number, x:number, y:number, w:number, h:number, rtl:number, rtr:number, rbr:number, rbl:number, fill?:FillSettings, stroke?:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (w === 0 || h === 0 || (!fill && !stroke) || alpha === 0) return; // nothing to draw

		this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);

		this.ctx.beginPath();
		this.ctx.moveTo(x + rtl, y);
		this.ctx.lineTo(x + w - rtr, y);
		this.ctx.quadraticCurveTo(x + w, y, x + w, y + rtr);
		this.ctx.lineTo(x + w, y + h - rbr);
		this.ctx.quadraticCurveTo(x + w, y + h, x + w - rbr, y + h);
		this.ctx.lineTo(x + rbl, y + h);
		this.ctx.quadraticCurveTo(x, y + h, x, y + h - rbl);
		this.ctx.lineTo(x, y + rtl);
		this.ctx.quadraticCurveTo(x, y, x + rtl, y);
		this.ctx.closePath();

		this.fillStroke(fill, stroke);
	}


	/**
	 * Draws a path.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param path The set of points to move to.
	 * @param fill The fill settings to use. Supply null for no fill.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawPath(matrix:Matrix2D, alpha:number, path:Vector2[], fill?:FillSettings, stroke?:StrokeSettings, close:boolean = true, imageSmoothingEnabled:boolean = true):void
	{
		if (path.length <= 1 || (!fill && !stroke)) return; // nothing to draw

		this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);

		this.ctx.beginPath();
		this.ctx.moveTo(path[0].x, path[0].y);
		for (let i:number = 1; i < path.length; ++i)
		{
			this.ctx.lineTo(path[i].x, path[i].y);
		}
		if (close && path.length > 2)
		{
			this.ctx.lineTo(path[0].x, path[0].y);
		}

		this.fillStroke(fill, stroke);
	}

	/**
	 * Draws a circle of the supplied radius with the supplied fill and/or stroke and shadow.
	 * If you don't supply a stroke or a fill, nothing will be rendered.
	 * Stroke and fill order (if both are supplied) is determined by the stroke.underFill property.
	 * @param matrix The transformation matrix to draw at.
	 * @param alpha The alpha to draw with.
	 * @param x An additional x transformation to draw with.
	 * @param y An additional y transformation to draw with.
	 * @param r The radius to draw.
	 * @param fill The fill settings to use. Supply null for no fill.
	 * @param stroke The stroke settings to use. Supply stroke for no fill.
	 */
	public drawCircle(matrix:Matrix2D, alpha:number, x:number, y:number, r:number, startAngle:number, endAngle:number, fill?:FillSettings, stroke?:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (startAngle === endAngle || r === 0 || (!fill && !stroke)) return; // nothing to draw

		this.apply(matrix, alpha, null, fill, stroke, imageSmoothingEnabled);

		startAngle = MathUtil.DEG_TO_RAD * startAngle;
		endAngle = MathUtil.DEG_TO_RAD * endAngle;

		this.ctx.beginPath();
		this.ctx.arc(x, y, r, startAngle, endAngle, false);
		// TODO: FUTURE- Would it be faster to store the path in the primitive and pass it in

		this.fillStroke(fill, stroke);
	}


	//#region Helpers
	/**
	 * Draws the fills and strokes.
	 * @param fill The fill settings to fill with.
	 * @param stroke The stroke settings to stroke with.
	 */
	private fillStroke(fill:FillSettings, stroke:StrokeSettings, imageSmoothingEnabled:boolean = true):void
	{
		if (stroke && stroke.underFill)
		{
			this.ctx.stroke();
		}
		
		if (fill)
		{
			this.ctx.fill();
		}

		if (stroke && !stroke.underFill)
		{
			this.ctx.stroke();
		}
	}
	//#endregion
}
