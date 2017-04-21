


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
  checkStack = (dest, delta, height, radius) => {
    let blockStackFull = false;
    let dYtorso = Math.round(dest.y + height/2);
    let dYhead = Math.round(dest.y + height);

    if(!this.world.isValidBlock(delta.x, delta.y, delta.z) || this.world.getBlock(delta.x, delta.y, delta.z)) blockStackFull = true;
    else if(!this.world.isValidBlock(delta.x, dYtorso, delta.z) || this.world.getBlock(delta.x, dYtorso, delta.z)) blockStackFull = true;
    else if(!this.world.isValidBlock(delta.x, dYhead, delta.z) || this.world.getBlock(delta.x, dYhead, delta.z )) blockStackFull = true;

    if (this.frame % 10 == 0) {
     console.log("VOXEL:: Blockstack", blockStackFull)
    }


    this.frame += 1

    //if this block stack is empty, there's no collision
    if(!blockStackFull) return dest;

    //otherwise we actually need to do a collision test
    let xCollide = (dest.x + radius > delta.x && dest.x - radius < delta.x + 1);
    let zCollide = (dest.z + radius > delta.z && dest.z - radius < delta.z + 1);
    //if we miss one of the easy axes, there's no collision
    if( !xCollide || !zCollide) return dest;

    //there might be a collision, so the x and y depths are now useful
    let circleXMin = dest.x - radius;
    let circleXMax = dest.x + radius;
    let xCollideStart = (circleXMin < delta.x ? delta.x : circleXMin);
    let xCollideEnd = (circleXMax > (delta.x + 1.0) ? (delta.x + 1.0) : circleXMax);
    let xDepth = xCollideEnd - xCollideStart;

    let circleZMin = dest.z - radius;
    let circleZMax = dest.z + radius;
    let zCollideStart = (circleZMin < delta.z ? delta.z : circleZMin);
    let zCollideEnd = (circleZMax > (delta.z + 1.0) ? (delta.z + 1.0) : circleZMax);
    let zDepth = zCollideEnd - zCollideStart;

    //NEED TO USE VORONOI REGIONS TO DETERMINE WHICH AXES MAKE A COLLISION

    //left side of cube
    if(dest.x < delta.x){
      //bottom grid square
      if(dest.z < delta.z){
        let BLDepth = radius - Math.sqrt( (delta.x - dest.x)*(delta.x - dest.x) + (delta.z - dest.z)*(delta.z - dest.z) ); //bottom left
        if( (circleZMax > delta.z) && (circleXMax > delta.x) && (BLDepth > 0.0) ){
          //we collided with the BL corner of the cube, so project outward along the BL axis
          let proj = new THREE.Vector2(dest.x - delta.x, dest.z - delta.z);
          proj.normalize()
          dest.x = proj.x * BLDepth; dest.z = proj.z * BLDepth;
        }
      }
      //top grid square
      else if (dest.z > delta.z + 1) {
        let TLDepth = radius - Math.sqrt( (delta.x - dest.x)*(delta.x - dest.x) + (delta.z + 1 - dest.z)*(delta.z + 1 - dest.z) ); //top left
        if( (circleZMin > delta.z + 1) && (circleXMax > delta.x)  && (TLDepth > 0) ){
          //we collided with the TL corner of the cube, so project outward along the TL axis
          let proj = new THREE.Vector2(dest.x - delta.x, dest.z - (delta.z + 1));
          proj.normalize()
          dest.x = proj.x * TLDepth; dest.z = proj.z * TLDepth;
        }
      }
      //dest.y in cube's y-axis
      else {
        if (circleXMax > delta.x) {
          dest.x -= xDepth;//we collided with the left side of the cube, so project left along the X-axis
        }
      }
    }
    //right side of cube
    else if (dest.x > delta.x + 1) {
      //bottom grid square
      if (dest.z < delta.z) {
        let BRDepth = radius - Math.sqrt( (delta.x + 1 - dest.x)*(delta.x + 1- dest.x) + (delta.z - dest.z)*(delta.z - dest.z) ); //bottom right
        if( (circleZMax > delta.z) && (circleXMin < delta.x + 1) && ( BRDepth > 0) ){
          //we collided with the BR corner of the cube, so project outward along the BR axis
          let proj = new THREE.Vector2(dest.x - (delta.x + 1), dest.z);
          proj.normalize()

          dest.x = proj.x * BRDepth; dest.z = proj.z * BRDepth;
        }
      }
      //top grid square
      else if (dest.z > delta.z + 1) {
        let TRDepth = radius - Math.sqrt( (delta.x + 1 - dest.x)*(delta.x + 1- dest.x) + (delta.z + 1 - dest.z)*(delta.z + 1 - dest.z) ); //top right
        if ( (circleZMin < delta.z + 1) && (circleXMin < delta.x + 1) && (TRDepth < 0) ){
          //we collided with the TR corner of the cube, so project outward along the TR axis
          let proj = new THREE.Vector2(dest.x - (delta.x + 1), dest.z + (delta.z + 1));
          proj.normalize()
          dest.x = proj.x * TRDepth; dest.z = proj.z * TRDepth;
        }
      }
      //dest.y in cube's y-axis
      else {
        if( ( circleXMin < delta.x + 1) ) {
          dest.x += xDepth; //we collided with the right side of the cube, so project right along the X-axis
        }
      }
    }
    //center.x in cube's x-axis
    else {
      //bottom grid square
      if (dest.z < delta.z) {
        if( circleZMax > delta.z ) {
          dest.z -= zDepth; //we collided with the bottom side of the cube, so project down along the Y-axis
        }
      }
      //top grid square
      else if (dest.z > delta.z + 1) {
        if( (circleZMin < delta.z + 1) ) {
        dest.z += zDepth; //we collided with the top side of the cube, so project up along the Y-axis
        }

      }
      //INSIDE the cube
      else {
        if (xDepth < zDepth) { //project out of x-axis
          if (dest.x > delta.x + 0.5) {
          dest.x += xDepth; //right half goes right
          } else {
          dest.x -= xDepth;
          }

        } else {
          if(dest.z > delta.z + 0.5) {
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

    let posX = Math.round(pos.x);
    let posZ = Math.round(pos.z);


    const EPSILON = 0.001;
    let yMovement = dir.y;
    let dY = Math.round(pos.y + dir.y);
    let yOffset = 1;

    // if (this.frame % 10 == 0) {

    console.log("VOXEL::", pos, this.world.isValidBlock(posX, dY, posZ), this.world.getBlock(posX, dY, posZ))
// }

    //first, check to see if there's y movement
    if(Math.abs(dir.y) > 0) {
      //then determine the correct Y-layer to test

      if(dir.y > 0)
      dY = Math.round(pos.y + height + dir.y); //check head location
      //check the location we're in
      if( !this.world.isValidBlock(posX, dY, posZ) || this.world.getBlock(posX, dY, posZ) ){
        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0)
        yMovement = dY - (pos.y + height + EPSILON);
      }
      //check the block to the right
      else if( (pos.x + radius > posX + 1) && (!this.world.isValidBlock(posX+1, posY, dZ) || this.world.getBlock(posX+1, dY, posZ)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0)
        yMovement = dY - (pos.y + height + EPSILON);
      }
      //check the block to the left
      else if( (pos.x - radius < posX) && (!this.world.isValidBlock(posX-1, dY, posZ) || this.world.getBlock(posX-1,dY, posZ)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0)
        yMovement = dY - (pos.y + height + EPSILON);
      }
      //check the block to the back
      else if( (pos.z + radius > posZ + 1) && (!this.world.isValidBlock(posX, posY+1, dY) || this.world.getBlock(posX,posY+1, dZ)) ){

        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0)
        yMovement = dY - (pos.y + height + EPSILON);
      }
      //check the block to the front
      else if( (pos.z - radius < posZ) && (!this.world.isValidBlock(posX,dY, posZ-1) || this.world.getBlock(posX, dY, posZ-1)) ){
        yMovement = (dY + yOffset) - pos.y;
        if(dir.y > 0)
        yMovement = dY - (pos.y + height + EPSILON);
      }
    }

    //correct for the actual yMovement performed
    let fdest = new THREE.Vector3(pos.x + dir.x, pos.y + yMovement, pos.z + dir.z);
    let dX = Math.round(fdest.x);
    dY = Math.round(fdest.y);
    let dZ = Math.round(fdest.z);

    // console.log(yMovement, dir.y, pos.y, posX,dY, posZ-1, this.world.isValidBlock(posX,dY, posZ-1), this.world.getBlock(posX,dY, posZ-1))

    // //then, once moved into the y position, perform the xz-movements
    // fdest = this.checkStack(fdest, new THREE.Vector3( dX, dY, dZ), height, radius); //center :: ANNOTATION IS PLAYER POSITION RELATIVE TO COLLIDING BLOCK
    //
    // if (fdest.x + radius > dX + 1){
    //   fdest = this.checkStack(fdest, new THREE.Vector3( dX+1, dY, dZ), height, radius); //left
    //   dX = Math.round(fdest.x);
    //   dY = Math.round(fdest.y);
    //   dZ = Math.round(fdest.z);
    // }
    // else if( fdest.x - radius < dX ){
    //   fdest = this.checkStack(fdest, new THREE.Vector3( dX-1, dY, dZ), height, radius); //right BROKEN
    //   dX =  Math.round(fdest.x);
    //   dY =  Math.round(fdest.y);
    //   dZ =  Math.round(fdest.z);
    // }
    //
    // if( fdest.z + radius > dZ + 1){
    //   fdest = this.checkStack(fdest, new THREE.Vector3( dX, dY, dZ+1), height, radius); //front
    //   dX =  Math.round(fdest.x);
    //   dY =  Math.round(fdest.y);
    //   dZ =  Math.round(fdest.z);
    // }
    // else if( fdest.z - radius < dZ ){
    //   fdest = this.checkStack(fdest, new THREE.Vector3( dX, dY, dZ-1), height, radius); //back BROKEN
    //   dX =  Math.round(fdest.x);
    //   dY =  Math.round(fdest.y);
    //   dZ =  Math.round(fdest.z);
    // }
    // fdest.y *= -1
    //TODO: check the diagonals too!!!

    console.log("VOXEL:: output", fdest, yMovement)


    return fdest;
  }

}
