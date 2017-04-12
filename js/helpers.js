// ==========================================
// Helpers
//
// This file contains helper classes and functions.
// ==========================================

// ==========================================
// Vector class
// ==========================================
'strict'
export default class Vector {
	constructor( x, y, z ) {
		this.x = x;
		this.y = y;
		this.z = z;
	}


	add = ( vec ) =>
	{
		return new Vector( this.x + vec.x, this.y + vec.y, this.z + vec.z );
	}

	sub = ( vec ) =>
	{
		return new Vector( this.x - vec.x, this.y - vec.y, this.z - vec.z );
	}

	mul = ( n ) =>
	{
		return new Vector( this.x*n, this.y*n, this.z*n );
	}

	length = () =>
	{
		return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );
	}

	distance = ( vec ) =>
	{
		return this.sub( vec ).length();
	}

	normal = () =>
	{
		if ( this.x == 0 && this.y == 0 && this.z == 0 ) return new Vector( 0, 0, 0 );
		var l = this.length();
		return new Vector( this.x/l, this.y/l, this.z/l );
	}

	dot = ( vec ) =>
	{
		return this.x * vec.x + this.y * vec.y + this.z * vec.z;
	}

	toArray = () =>
	{
		return [ this.x, this.y, this.z ];
	}

	toString = () =>
	{
		return "( " + this.x + ", " + this.y + ", " + this.z + " )";
	}



}


// lineRectCollide( line, rect )
//
// Checks if an axis-aligned line and a bounding box overlap.
// line = { y, x1, x2 } or line = { x, y1, y2 }
// rect = { x, y, size }

export function lineRectCollide( line, rect )
{
	if ( line.y != null )
		return rect.y > line.y - rect.size/2 && rect.y < line.y + rect.size/2 && rect.x > line.x1 - rect.size/2 && rect.x < line.x2 + rect.size/2;
	else
		return rect.x > line.x - rect.size/2 && rect.x < line.x + rect.size/2 && rect.y > line.y1 - rect.size/2 && rect.y < line.y2 + rect.size/2;
}

// rectRectCollide( r1, r2 )
//
// Checks if two rectangles (x1, y1, x2, y2) overlap.

export function rectRectCollide( r1, r2 )
{
	if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) return true;
	if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) return true;
	if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) return true;
	if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) return true;
	return false;
}

// Export to node.js
// if ( typeof( exports ) != "undefined" )
// {
// 	exports.Vector = Vector;
// }
