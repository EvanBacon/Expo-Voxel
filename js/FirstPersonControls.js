/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

 import Expo, {GLView} from 'expo';
 import React, { PropTypes } from 'react';
 import {PanResponder, Dimensions} from 'react-native'
 const {width, height} = Dimensions.get('window')


 import * as THREE from 'three';

export default function ( object, domElement ) {

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

	this.handleResize = function () {
			this.viewHalfX = width / 2;
			this.viewHalfY = height / 2;
	};

	this.onMouseDown = function ( event, numberOfTouches ) {


		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
      // if (numberOfTouches > 1) {
      //   this.moveForward = true;
      // }


			// switch ( event.button ) {
      //
			// 	case 0: this.moveForward = true; break;
			// 	case 2: this.moveBackward = true; break;
      //
			// }

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event, numberOfTouches ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
      // this.moveForward = false
			// switch ( event.button ) {
      //
			// 	case 0: this.moveForward = false; break;
			// 	case 2: this.moveBackward = false; break;
      //
			// }

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event, numberOfTouches, gestureState ) {

		// if ( this.domElement === document ) {

    this.mouseX = gestureState.dx;
    this.mouseY = gestureState.dy;
			// this.mouseX = event.nativeEvent.pageX - this.viewHalfX;
			// this.mouseY = event.nativeEvent.pageY - this.viewHalfY;

		// } else {
    //
		// 	this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
		// 	this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
    //
		// }

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta, moveID ) {

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
      case 0: //Top
      this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
      break;
      case 1: //Left
      this.object.translateX( - actualMoveSpeed );
      break;
      case 2: //Center
      this.object.translateY( actualMoveSpeed );
      break;
      case 3: //Right
      this.object.translateX( actualMoveSpeed );
      break;
      case 4: //Bottom
      this.object.translateZ( actualMoveSpeed );
      break;
      default:
      break;
    }


		// if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		// if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
    //
		// if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		// if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
    //
		// if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		// if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

    const damp = 0.95
    this.mouseX *= damp
    this.mouseY *= damp

	};

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function() {

	}

	this.handleResize();
};
