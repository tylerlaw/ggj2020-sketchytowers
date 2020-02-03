/** @file EffectSprite.ts */

interface EffectSprite extends Sprite
{
	isDead:boolean;
	update?(elapsed:number):void;
}
