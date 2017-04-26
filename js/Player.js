/**
* @author mrdoob / http://mrdoob.com/
* @author alteredq / http://alteredqualia.com/
* @author paulirish / http://paulirish.com/
*/

import React, { PropTypes } from 'react';

import * as THREE from 'three';

import GestureType from './GestureType'

import DirectionType from './DirectionType'

export default class Player {
  HEIGHT = 1.7;

  constructor( camera, physics ) {
    this.physics = physics
    this.camera = camera;
    this.position = new THREE.Vector3( 0, 0, 0 );
    this.velocity = new THREE.Vector3( 0, 0, 0 );
    this.action = -1

    this.target = new THREE.Vector3( 0, 0, 0 );
    this.enabled = true;

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.05;

    this.lookVertical = true;
    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.autoSpeedFactor = 0.0;

    this.touchX = 0;
    this.touchY = 0;

    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;

    /// Screen Center
    this.viewHalfX = 0;
    this.viewHalfY = 0;
  }

  jump = () => {
    if (
      !this.physics.world.isValidBlock(this.position.x, this.position.y - 0.01, this.position.z) ||
      this.physics.world.getBlock(this.position.x, this.position.y - 0.01, this.position.z )
    ) {
      this.velocity.y = 9.0;
    }
  }

  look = (horizontal, vertical) => {
    this.touchX = horizontal;
    this.touchY = vertical;
  }


  checkDeath = () => {
    if (this.position.y < -1 || this.position.y > 200) {
      console.log("VOXEL:: Dead", this.position)
      this.setPosition(new THREE.Vector3(50, 50, 50))
      // this.position.y = 50
      // this.position.x = 0
      // this.position.z = 0
    }
  }

  setPosition = (position) => {
    const {x, y, z} = position
    this.camera.position.set(x, y + (this.HEIGHT - 1), z)
    this.position = position

    ///Update Camera
    this.checkDeath()
  }

  setSize = (width, height) => {
    this.viewHalfX = width / 2;
    this.viewHalfY = height / 2;
  }

  onGesture = (event, gestureState, type) => {
    event.preventDefault();
    switch (type) {
      case GestureType.began:
      break;
      case GestureType.moved:
      this.look(gestureState.dx, gestureState.dy)
      break;
      case GestureType.ended:
      break;
      default:
      console.warn("Unknown Gesture State: ", gestureState)
      break;
    }
  }

  checkedMovement = (direction) => {
    //for any input movement, break it down into granular chunks so the displacement
    //of a chunk in any axis is less than the radius of the player

    const {HEIGHT} = this;
    const RADIUS = 0.3;
    //const int X_AXIS = 0, Y_AXIS = 1, Z_AXIS = 2;

    // determine which axis has the most displacement
    let xMult = 1;
    if( Math.abs(direction.x) > RADIUS ) xMult = Math.abs(RADIUS / direction.x);

    let yMult = 1;
    if( Math.abs(direction.y) > RADIUS ) yMult = Math.abs(RADIUS / direction.y);

    let zMult = 1;
    if( Math.abs(direction.z) > RADIUS ) zMult = Math.abs(RADIUS / direction.z);

    // and use that to break the direction vector into pieces
    let piece = xMult < zMult ? (xMult < yMult ? xMult : yMult) : (zMult < yMult ? zMult : yMult);
    direction.x *= piece; direction.z *= piece; direction.y *= piece;

    let pieces = Math.floor(1 / piece);

    const {position} = this
    let _position = new THREE.Vector3(position.x, position.y, position.z)

    for(let i = 0; i < pieces; i++){
      // collide that shizzle
      let oldPos = _position;
      _position = this.physics.checkMovement2(_position, direction, HEIGHT, RADIUS);

      // console.log("Moved by", oldPos.x - this.position.x, oldPos.y - this.position.y, oldPos.z - this.position.z)
      if( Math.abs( oldPos.y - _position.y ) < 0.00001 ) { // set velocity to zero if we stopped moving vertically
        this.velocity.y = 0;
      }
    }
    return _position
  }


  movePlayer = (delta, directionType) => {
    if ( this.heightSpeed ) {
      var y = THREE.Math.clamp( this.position.y, this.heightMin, this.heightMax );
      var heightDelta = y - this.heightMin;
      this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
    } else {
      this.autoSpeedFactor = 0.0;
    }

    let movement = new THREE.Vector3( 0, 0, 0 );

    var actualMoveSpeed = delta * this.movementSpeed;

    switch (directionType) {
      case DirectionType.front: //Top

      movement.x += (actualMoveSpeed + this.autoSpeedFactor) * Math.sin( this.phi ) * Math.cos( this.theta );
      movement.z += (actualMoveSpeed + this.autoSpeedFactor) * Math.sin( this.phi ) * Math.sin( this.theta );

      break;
      case DirectionType.left: //Left
      {
      let angle = -(Math.PI / 2)

      movement.x += (actualMoveSpeed) * Math.sin( this.phi ) * Math.cos( this.theta + angle);
      movement.z += (actualMoveSpeed) * Math.sin( this.phi ) * Math.sin( this.theta + angle);
      }

      break;
      case DirectionType.up: //Center
      this.jump()
      // movement.y += actualMoveSpeed;
      break;
      case DirectionType.right: //Right
      {
        let angle = (Math.PI / 2)
        movement.x += (actualMoveSpeed) * Math.sin( this.phi ) * Math.cos( this.theta + angle);
        movement.z += (actualMoveSpeed) * Math.sin( this.phi ) * Math.sin( this.theta + angle);
      }
      break;
      case DirectionType.back: //Bottom
      // movement.z += actualMoveSpeed;
      movement.x -= (actualMoveSpeed) * Math.sin( this.phi ) * Math.cos( this.theta );
      movement.z -= (actualMoveSpeed) * Math.sin( this.phi ) * Math.sin( this.theta );
      break;
      case DirectionType.down: //Down
      movement.y += -actualMoveSpeed;
      break;
      default:
      break;
    }


    const GRAVITY = -20;
    this.velocity.y += (GRAVITY * delta)
// this.velocity.y = 0
    movement.x += this.velocity.x * delta;
    movement.z += this.velocity.z * delta;
    movement.y += this.velocity.y * delta;

    this.setPosition(this.checkedMovement(movement))
  }

  rotatePlayer = (delta) => {

    var actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {
      actualLookSpeed = 0;
    }

    var verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
    }

    this.lon += this.touchX * actualLookSpeed;
    if ( this.lookVertical ) this.lat -= this.touchY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
    this.phi = THREE.Math.degToRad( 90 - this.lat );

    this.theta = THREE.Math.degToRad( this.lon );

    if (this.constrainVertical) {
      this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
    }

    var targetPosition = this.target, position = this.camera.position;

    targetPosition.x = (position.x) + 1 * Math.sin( this.phi ) * Math.cos( this.theta );
    targetPosition.y = (position.y) + 1 * Math.cos( this.phi );
    targetPosition.z = (position.z) + 1 * Math.sin( this.phi ) * Math.sin( this.theta );

    this.camera.lookAt( targetPosition );

  }

  update = ( delta, directionType ) => {
    if ( this.enabled === false ) return;

    this.movePlayer(delta, directionType)
    this.rotatePlayer(delta)
    const damp = 0.95
    this.touchX *= damp
    this.touchY *= damp
  }
}
