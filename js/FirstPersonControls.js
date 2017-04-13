/**
* @author mrdoob / http://mrdoob.com/
* @author alteredq / http://alteredqualia.com/
* @author paulirish / http://paulirish.com/
*/

import React, { PropTypes } from 'react';
import * as THREE from 'three';
import GestureType from './GestureType'
import DirectionType from './DirectionType'
export default class FirstPersonControls {

  constructor( object ) {
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

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.mouseDragOn = false;

    this.viewHalfX = 0;
    this.viewHalfY = 0;

  }

  setSize = (width, height) => {
    this.viewHalfX = width / 2;
    this.viewHalfY = height / 2;
  }

  onGesture = (event, gestureState, type) => {
    event.preventDefault();



    switch (type) {
      case GestureType.began:
      this.mouseDragOn = true;
      break;
      case GestureType.moved:
      this.mouseX = gestureState.dx;
      this.mouseY = gestureState.dy;
      break;
      case GestureType.ended:
      this.mouseDragOn = false;
      break;
      default:
      console.warn("Unknown Gesture State: ", gestureState)
      break;
    }
  }

  update = ( delta, moveID ) => {
    if ( this.enabled === false ) return;

    if ( this.heightSpeed ) {
      var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
      var heightDelta = y - this.heightMin;
      this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
    } else {
      this.autoSpeedFactor = 0.0;
    }

    var actualMoveSpeed = delta * this.movementSpeed;

    switch (moveID) {
      case DirectionType.front: //Top
      this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
      break;
      case DirectionType.left: //Left
      this.object.translateX( - actualMoveSpeed );
      break;
      case DirectionType.up: //Center
      this.object.translateY( actualMoveSpeed );
      break;
      case DirectionType.right: //Right
      this.object.translateX( actualMoveSpeed );
      break;
      case DirectionType.back: //Bottom
      this.object.translateZ( actualMoveSpeed );
      break;
      case DirectionType.down: //Down
      this.object.translateY( - actualMoveSpeed );
      break;
      default:
      break;
    }

    var actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {
      actualLookSpeed = 0;
    }

    var verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
    }

    this.lon += this.mouseX * actualLookSpeed;
    if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
    this.phi = THREE.Math.degToRad( 90 - this.lat );

    this.theta = THREE.Math.degToRad( this.lon );

    if (this.constrainVertical) {
      this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
    }

    var targetPosition = this.target, position = this.object.position;

    targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
    targetPosition.y = position.y + 100 * Math.cos( this.phi );
    targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

    this.object.lookAt( targetPosition );

    const damp = 0.95
    this.mouseX *= damp
    this.mouseY *= damp

  }
}
