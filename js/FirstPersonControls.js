/**
* @author mrdoob / http://mrdoob.com/
* @author alteredq / http://alteredqualia.com/
* @author paulirish / http://paulirish.com/
*/


// lineRectCollide( line, rect )
//
// Checks if an axis-aligned line and a bounding box overlap.
// line = { y, x1, x2 } or line = { x, y1, y2 }
// rect = { x, y, size }

function lineRectCollide( line, rect )
{
	if ( line.y != null )
	return rect.y > line.y - rect.size/2 && rect.y < line.y + rect.size/2 && rect.x > line.x1 - rect.size/2 && rect.x < line.x2 + rect.size/2;
	else
	return rect.x > line.x - rect.size/2 && rect.x < line.x + rect.size/2 && rect.y > line.y1 - rect.size/2 && rect.y < line.y2 + rect.size/2;
}

// rectRectCollide( r1, r2 )
//
// Checks if two rectangles (x1, y1, x2, y2) overlap.

function rectRectCollide( r1, r2 )
{
	if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) return true;
	if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) return true;
	if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) return true;
	if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) return true;
	return false;
}



const BLOCK = {AIR: -1}
import React, { PropTypes } from 'react';
import * as THREE from 'three';
import GestureType from './GestureType'
import DirectionType from './DirectionType'
export default class FirstPersonControls {

	constructor( object, world ) {
		this.world = world;
		this.object = object;

		this.target = new THREE.Vector3( 0, 0, 0 );
		this.enabled = true;

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.005;

		this.lookVertical = true;
		this.autoForward = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;
		this.heightMax = 1.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		this.autoSpeedFactor = 0.0;

		this.mouseX = 0;
		this.mouseY = 0;

		this.lat = 0;
		this.lon = 0;
		this.phi = 0;
		this.theta = 0;

		this.motion = {
			airborne : false,
			position : new THREE.Vector3(), velocity : new THREE.Vector3(),
			rotation : new THREE.Vector2(), spinning : new THREE.Vector2()
		};


		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.mouseDragOn = false;

		this.viewHalfX = 0;
		this.viewHalfY = 0;

		this.pos = new THREE.Vector3( 0, 0, 0 );

		this.velocity = new THREE.Vector3( 0, 0, 0 );
		this.angles = [ 0, Math.PI, 0 ];
		this.falling = false;


	}

	resetPlayer = () => {
		if( this.motion.position.y < -123 ) {
			this.motion.position.set( -2, 7.7, 25 );
			this.motion.velocity.multiplyScalar( 0 );
		}
	};
	setSize = (width, height) => {
		this.viewHalfX = width / 2;
		this.viewHalfY = height / 2;
	}

	onGesture = (event, gestureState, type) => {
		event.preventDefault();
		switch (type) {
			case GestureType.began:
			// this.dragging = true;
			this.mouseDown = true;
			this.yawStart = this.targetYaw = this.angles[1];
			this.pitchStart = this.targetPitch = this.angles[0];

			break;
			case GestureType.moved:

			this.dragging = true;
			this.targetPitch = this.pitchStart - ( gestureState.dy ) / 200;
			this.targetYaw = this.yawStart + ( gestureState.dx ) / 200;

			break;
			case GestureType.ended:
			if ( Math.abs( gestureState.dx ) + Math.abs( gestureState.dy ) < 4 )	{
				// this.doBlockAction( x, y, !rmb );
				// TODO: Tap
			}


			this.dragging = false;
			this.mouseDown = false;
			break;
			default:
			console.warn("Unknown Gesture State: ", gestureState)
			break;
		}
	}


	// getEyePos()
	//
	// Returns the position of the eyes of the player for rendering.

	getEyePos = () =>
	{
		return this.pos.add( new THREE.Vector3( 0.0, 0.0, 1.7 ) );
	}

	// update()
	//
	// Updates this local player (gravity, movement)


	update = (dt, direction) =>
	{
		var world = this.world;
		var velocity = this.velocity;
		var pos = this.pos;
		var bPos = new THREE.Vector3(
			Math.floor( pos.x ),
			Math.floor( pos.y ),
			Math.floor( pos.z )
		);

		if ( this.lastUpdate != null )
		{
			var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;

			// View
			if ( this.dragging )
			{
				this.angles[0] += ( this.targetPitch - this.angles[0] ) * 30 * delta;
				this.angles[1] += ( this.targetYaw - this.angles[1] ) * 30 * delta;
				if ( this.angles[0] < -Math.PI/2 ) this.angles[0] = -Math.PI/2;
				if ( this.angles[0] > Math.PI/2 ) this.angles[0] = Math.PI/2;
			}

			// Gravity
			if (this.falling)
			velocity.z += -0.5;

			// Jumping
			if ( direction === DirectionType.up && !this.falling )
			velocity.z = 8;

			// Walking
			var walkVelocity = new THREE.Vector3( 0, 0, 0 );

			if ( !this.falling ) {

				let angle = Math.PI + this.angles[1]
				if ( direction === DirectionType.front) {
					walkVelocity.x += Math.cos( angle );
					walkVelocity.y += Math.sin( angle );
				}
				if (  direction === DirectionType.back) {
					walkVelocity.x += Math.cos( Math.PI + angle );
					walkVelocity.y += Math.sin( Math.PI + angle );
				}
				if (  direction === DirectionType.left) {
					walkVelocity.x += Math.cos( (-Math.PI / 2) + angle );
					walkVelocity.y += Math.sin( (-Math.PI / 2) + angle );
				}
				if (  direction === DirectionType.right) {
					walkVelocity.x += Math.cos( (Math.PI / 2) + angle );
					walkVelocity.y += Math.sin( (Math.PI / 2) + angle );
				}
			}

			if ( walkVelocity.length() > 0 ) {
				walkVelocity = walkVelocity.normalize();
				velocity.x = walkVelocity.x * 4;
				velocity.y = walkVelocity.y * 4;

			} else {
				velocity.x /= this.falling ? 1.01 : 1.5;
				velocity.y /= this.falling ? 1.01 : 1.5;
			}

			// Resolve collision
			this.pos = this.resolveCollision( pos, bPos, velocity.multiplyScalar( delta ) );
		}

		this.object.position.x = this.pos.x * 100
		this.object.position.z = this.pos.y * 100
		this.object.position.y = this.pos.z * 100

		let targetPosition = new THREE.Vector3()
		targetPosition.x = this.object.position.x + 100 * Math.sin( this.angles[0] ) * Math.cos( this.angles[1] );
		targetPosition.y = this.object.position.y + 100 * Math.cos( this.angles[0] );
		targetPosition.z = this.object.position.z + 100 * Math.sin( this.angles[0] ) * Math.sin( this.angles[1] );

		this.object.lookAt( targetPosition );

		this.lastUpdate = new Date().getTime();
	}

	// resolveCollision( pos, bPos, velocity )
	//
	// Resolves collisions between the player and blocks on XY level for the next movement step.

	resolveCollision = ( pos, bPos, velocity ) =>
	{
		var world = this.world;
		var playerRect = { x: pos.x + velocity.x, y: pos.y + velocity.y, size: 0.25 };

		// Collect XY collision sides
		var collisionCandidates = [];

		for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
		{
			for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
			{
				for ( var z = bPos.z; z <= bPos.z + 1; z++ )
				{
					if ( world.getBlock( x, y, z ) != BLOCK.AIR )
					{
						if ( world.getBlock( x - 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x, dir: -1, y1: y, y2: y + 1 } );
						if ( world.getBlock( x + 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x + 1, dir: 1, y1: y, y2: y + 1 } );
						if ( world.getBlock( x, y - 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y, dir: -1, x1: x, x2: x + 1 } );
						if ( world.getBlock( x, y + 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y + 1, dir: 1, x1: x, x2: x + 1 } );
					}
				}
			}
		}

		// Solve XY collisions
		for( var i in collisionCandidates )
		{
			var side = collisionCandidates[i];

			if ( lineRectCollide( side, playerRect ) )
			{
				if ( side.x != null && velocity.x * side.dir < 0 ) {
					pos.x = side.x + playerRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
					velocity.x = 0;
				} else if ( side.y != null && velocity.y * side.dir < 0 ) {
					pos.y = side.y + playerRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
					velocity.y = 0;
				}
			}
		}

		var playerFace = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
		var newBZLower = Math.floor( pos.z + velocity.z );
		var newBZUpper = Math.floor( pos.z + 1.7 + velocity.z * 1.1 );

		// Collect Z collision sides
		collisionCandidates = [];

		for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
		{
			for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
			{
				if ( world.getBlock( x, y, newBZLower ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZLower + 1, dir: 1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
				if ( world.getBlock( x, y, newBZUpper ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZUpper, dir: -1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
			}
		}

		// Solve Z collisions
		this.falling = true; //True
		for ( var i in collisionCandidates )
		{
			var face = collisionCandidates[i];

			if ( rectRectCollide( face, playerFace ) && velocity.z * face.dir < 0 )
			{
				if ( velocity.z < 0 ) {
					this.falling = false;
					pos.z = face.z;
					velocity.z = 0;
					this.velocity.z = 0;
				} else {
					pos.z = face.z - 1.8;
					velocity.z = 0;
					this.velocity.z = 0;
				}

				break;
			}
		}

		// Return solution
		return pos.add( velocity );
	}
}
