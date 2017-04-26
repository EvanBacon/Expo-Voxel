
'use-strict';

import * as THREE from 'three';

export default class Physics {

  constructor(world) {
    this.world = world
  }

  addGravityAcceleration(velocity, deltaT){
    const GRAVITY = -20;
    velocity.y += GRAVITY * deltaT;
    //velocity->z = 0;
    return velocity
  }

  frame = 0;
  //takes a destination, and an object delta (X, Y, Z) of its base, plus a float height and radius, determines if there's a collision
  //NOTE: for this method to be accurate on our grid, the maginute of the motion must be LESS THAN the radius of the player
  checkStack = (dest, deltaX:number, deltaY:number, deltaZ:number, height:number, radius:number) => {
    let blockStackFull: boolean = false;
    let dYtorso: number = Math.floor(dest.y + height/2);
    let dYhead: number = Math.floor(dest.y + height);

    if (!this.world.isValidBlock(deltaX, deltaY, deltaZ) || this.world.getBlock(deltaX, deltaY, deltaZ)) {
      blockStackFull = true;
    } else if (!this.world.isValidBlock(deltaX, dYtorso, deltaZ) || this.world.getBlock(deltaX, dYtorso, deltaZ)) {
      blockStackFull = true;
    } else if (!this.world.isValidBlock(deltaX, dYhead, deltaZ) || this.world.getBlock(deltaX, dYhead, deltaZ )) {
      blockStackFull = true;
    }

    if (this.frame % 10 == 0) {
      //  console.log("VOXEL:: Blockstack", blockStackFull)
    }


    this.frame += 1

    //if this block stack is empty, there's no collision
    if(!blockStackFull) return dest;

    //otherwise we actually need to do a collision test
    const xCollide: boolean = (((dest.x + radius) > deltaX) && (dest.x - radius < (deltaX + 1)) );
    const zCollide: boolean = (((dest.z + radius) > deltaZ) && (dest.z - radius < (deltaZ + 1)));
    //if we miss one of the easy axes, there's no collision
    if(!xCollide || !zCollide) return dest;
    // console.log("VOXEL:: collision", delta, this.world.getBlock(deltaX, deltaY, deltaZ))

    //there might be a collision, so the x and z depths are now useful
    let circleXMin: number = dest.x - radius;
    let circleXMax: number = dest.x + radius;
    let xCollideStart: number = (circleXMin < deltaX ? deltaX : circleXMin);
    let xCollideEnd: number = (circleXMax > (deltaX + 1.0) ? (deltaX + 1.0) : circleXMax);
    let xDepth: number = xCollideEnd - xCollideStart;

    let circleZMin: number = dest.z - radius;
    let circleZMax: number = dest.z + radius;
    let zCollideStart: number = (circleZMin < deltaZ ? deltaZ : circleZMin);
    let zCollideEnd: number = (circleZMax > (deltaZ + 1.0) ? (deltaZ + 1.0) : circleZMax);
    let zDepth: number = zCollideEnd - zCollideStart;
    //NEED TO USE VORONOI REGIONS TO DETERMINE WHICH AXES MAKE A COLLISION


    if (dest.x < deltaX) { //left side of cube

      if (dest.z < deltaZ) { //bottom grid square
        let BLDepth: number = radius - Math.sqrt( ((deltaX - dest.x)*(deltaX - dest.x)) + ((deltaZ - dest.z)*(deltaZ - dest.z)) ); //bottom left
        if ((circleZMax > deltaZ) && (circleXMax > deltaX) && (BLDepth > 0.0) ){
          //we collided with the BL corner of the cube, so project outward along the BL axis
          let proj = new THREE.Vector2(dest.x - deltaX, dest.z - deltaZ);
          proj.normalize()
          dest.x = proj.x * BLDepth; dest.z = proj.z * BLDepth;
        }
      } else if (dest.z > deltaZ + 1.0) { //top grid square
        let TLDepth: number = radius - Math.sqrt( ((deltaX - dest.x)*(deltaX - dest.x)) + ((deltaZ + 1 - dest.z)*(deltaZ + 1 - dest.z)) ); //top left
        if ( (circleZMin > deltaZ + 1.0) && (circleXMax > deltaX)  && (TLDepth > 0.0) ){
          //we collided with the TL corner of the cube, so project outward along the TL axis
          let proj = new THREE.Vector2(dest.x - deltaX, dest.z - (deltaZ + 1.0));
          proj.normalize()
          dest.x = proj.x * TLDepth; dest.z = proj.z * TLDepth;
        }
      } else { //dest.y in cube's y-axis
        if (circleXMax > deltaX) {
          dest.x -= xDepth;//we collided with the left side of the cube, so project left along the X-axis
        }
      }
    } else if (dest.x > deltaX + 1.0) { //right side of cube
      if (dest.z < deltaZ) { //bottom grid square
        let BRDepth: number = radius - Math.sqrt( ((deltaX + 1.0 - dest.x)*(deltaX + 1.0 - dest.x)) + ((deltaZ - dest.z) * (deltaZ - dest.z)) ); //bottom right
        if ( (circleZMax > deltaZ) && (circleXMin < deltaX + 1.0) && ( BRDepth > 0.0) ){
          //we collided with the BR corner of the cube, so project outward along the BR axis
          let proj = new THREE.Vector2(dest.x - (deltaX + 1.0), dest.z);
          proj.normalize()

          dest.x = proj.x * BRDepth; dest.z = proj.z * BRDepth;
        }
      } else if (dest.z > deltaZ + 1.0) { //top grid square
        let TRDepth: number = radius - Math.sqrt( (deltaX + 1.0 - dest.x)*(deltaX + 1.0 - dest.x) + (deltaZ + 1.0 - dest.z) * (deltaZ + 1.0 - dest.z) ); //top right
        if ( (circleZMin < deltaZ + 1.0) && (circleXMin < deltaX + 1.0) && (TRDepth < 0.0) ){
          //we collided with the TR corner of the cube, so project outward along the TR axis
          let proj = new THREE.Vector2(dest.x - (deltaX + 1.0), dest.z + (deltaZ + 1.0));
          proj.normalize()
          dest.x = proj.x * TRDepth; dest.z = proj.z * TRDepth;
        }
      } else { //dest.y in cube's y-axis
        if (circleXMin < deltaX + 1.0) {
          dest.x += xDepth; //we collided with the right side of the cube, so project right along the X-axis
        }
      }
    } else { //center.x in cube's x-axis
      if (dest.z < deltaZ) { //bottom grid square
        if (circleZMax > deltaZ) {
          dest.z -= zDepth; //we collided with the bottom side of the cube, so project down along the Y-axis
        }
      } else if (dest.z > deltaZ + 1.0) { //top grid square
        if (circleZMin < deltaZ + 1.0) {
          dest.z += zDepth; //we collided with the top side of the cube, so project up along the Y-axis
        }
      } else { //INSIDE the cube
        if (xDepth < zDepth) { //project out of x-axis
          if (dest.x > deltaX + 0.500) {
            dest.x += xDepth; //right half goes right
          } else {
            dest.x -= xDepth;
          }
        } else {
          if (dest.z > deltaZ + 0.500) {
            dest.z += zDepth; //top side goes up
          } else {
            dest.z -= zDepth;
          }
        }
      }
    }
    return dest;
  }

  checkMovement2 = (pos, dir, height, radius) => {
    // console.log(pos, dir)

    let posX: number = Math.floor(pos.x);
    let posZ: number = Math.floor(pos.z);


    const EPSILON = 0.001;
    let yMovement = dir.y;
    let dY = Math.floor(pos.y + dir.y);
    let yOffset = 1;

    // if (this.frame % 10 == 0) {
    // console.log("VOXEL::", pos, this.world.isValidBlock(posX, dY, posZ), this.world.getBlock(posX, dY, posZ))
    // }

    //first, check to see if there's y movement
    if(Math.abs(dir.y) > 0.0) {
      //then determine the correct Y-layer to test

      if(dir.y > 0) {
        dY = Math.floor(pos.y + height + dir.y); //check head location
      }

      //check the location we're in
      if( !this.world.isValidBlock(posX, dY, posZ) || this.world.getBlock(posX, dY, posZ) ){
        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0) {
          yMovement = dY - (pos.y + height + EPSILON);
        }
      }
      //check the block to the right
      else if( (pos.x + radius > posX + 1) && (!this.world.isValidBlock(posX+1, dY, posZ) || this.world.getBlock(posX+1, dY, posZ)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0) {
          yMovement = dY - (pos.y + height + EPSILON);
        }
      }
      //check the block to the left
      else if( (pos.x - radius < posX) && (!this.world.isValidBlock(posX-1, dY, posZ) || this.world.getBlock(posX-1,dY, posZ)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0) {
          yMovement = dY - (pos.y + height + EPSILON);
        }
      }
      //check the block to the back
      else if( (pos.z + radius > posZ + 1) && (!this.world.isValidBlock(posX, dY, posZ+1) || this.world.getBlock(posX, dY, posZ+1)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0) {
          yMovement = dY - (pos.y + height + EPSILON);
        }
      }
      //check the block to the front
      else if( (pos.z - radius < posZ) && (!this.world.isValidBlock(posX,dY, posZ-1) || this.world.getBlock(posX, dY, posZ-1)) ){
        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0) {
          yMovement = dY - (pos.y + height + EPSILON);
        }
      }
    }

    //correct for the actual yMovement performed
    let fdest = new THREE.Vector3(pos.x + dir.x, pos.y + yMovement, pos.z + dir.z);
    let dX = Math.floor(fdest.x);
    dY = Math.floor(fdest.y);
    let dZ = Math.floor(fdest.z);

    // console.log(yMovement, dir.y, pos.y, posX,dY, posZ-1, this.world.isValidBlock(posX,dY, posZ-1), this.world.getBlock(posX,dY, posZ-1))

    //then, once moved into the y position, perform the xz-movements
    fdest = this.checkStack(fdest, dX, dY, dZ, height, radius); //center :: ANNOTATION IS PLAYER POSITION RELATIVE TO COLLIDING BLOCK

    if (fdest.x + radius > dX + 1){
      fdest = this.checkStack(fdest, dX+1, dY, dZ, height, radius); //left
      dX = Math.floor(fdest.x);
      dY = Math.floor(fdest.y);
      dZ = Math.floor(fdest.z);
    }
    else if( fdest.x - radius < dX ){
      fdest = this.checkStack(fdest, dX-1, dY, dZ, height, radius); //right BROKEN
      dX =  Math.floor(fdest.x);
      dY =  Math.floor(fdest.y);
      dZ =  Math.floor(fdest.z);
    }

    if( fdest.z + radius > dZ + 1){
      fdest = this.checkStack(fdest,dX, dY, dZ+1, height, radius); //front
      dX =  Math.floor(fdest.x);
      dY =  Math.floor(fdest.y);
      dZ =  Math.floor(fdest.z);
    }
    else if( fdest.z - radius < dZ ){
      fdest = this.checkStack(fdest, dX, dY, dZ-1, height, radius); //back BROKEN
      dX =  Math.floor(fdest.x);
      dY =  Math.floor(fdest.y);
      dZ =  Math.floor(fdest.z);
    }
    // fdest.y *= -1
    // TODO: check the diagonals too!!!

    // console.log("VOXEL:: output", fdest, yMovement)


    return fdest;
  }

}
