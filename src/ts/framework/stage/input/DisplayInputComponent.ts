/** @file DisplayInputComponent.ts */

/// <reference path="../../math/geom/PointHitArea.ts" />

/** Interface for handling display object events. */
interface DisplayObjectHandler { (displayObject:Sprite):void; }

/** Interface for handling display object events that bubble. */
interface DisplayObjectBubbleHandler { (currentDisplayObject:Sprite, target:Sprite):void; }

/**
 * Handles input for a display object.
 */
class DisplayInputComponent
{
	/** Dispatched when this object is moused over. */
	public readonly onPointerOver:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is moused out. */
	public readonly onPointerOut:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is rolled over. */
	public readonly onPointerRollOver:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is rolled out. */
	public readonly onPointerRollOut:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is pressed on. */
	public readonly onPointerPress:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is released on. */
	public readonly onPointerRelease:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when this object is clicked on. */
	public readonly onPointerClick:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();

	/** Dispatched when a press on this object is canceled. */
	public readonly onPointerCancel:DelegateEvent<DisplayObjectBubbleHandler> = new DelegateEvent<DisplayObjectBubbleHandler>();


	/** The display object this input component is attached to. */
	public readonly displayObject:Sprite;

	/** Indicates if this object is allowed to accept pointer events. */
	public pointerEnabled:boolean;

	/** Indicates if this object's children are allowed to accept pointer events. */
	public pointerChildrenEnabled:boolean;

	/** The hit area used to test against, if any. */
	public hitArea:PointHitArea;


	public constructor(displayObject:Sprite, pointerEnabled:boolean = true, pointerChildrenEnabled:boolean = true, hitArea:PointHitArea = null)
	{
		this.displayObject = displayObject;
		this.pointerEnabled = pointerEnabled;
		this.pointerChildrenEnabled = pointerChildrenEnabled;
		this.hitArea = hitArea;
	}
}
