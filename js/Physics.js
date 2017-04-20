



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

checkMovement(position, direction, radius, axis){
	int posX = position.x; int posY = position.y; int posZ = position.z;
	BOOL cool = YES;

	switch (axis) {
		case 0:
		{ //X
			//determine which x direction to check
			int xOffset = 1;
			if( direction.x < 0 ) xOffset = -1;

			//check the x direction, 1 or 2 of 3 possible blocks
			cool = cool && this.world.isValidBlock(posX + xOffset, posY, posZ) && !this.world.getBlock(posX + xOffset, posY, posZ);
			if( position.z + radius > posZ ){ //check positive Y neighbor
				cool = cool && this.world.isValidBlock(posX + xOffset, posY, posZ + 1) && !this.world.getBlock(posX + xOffset, posY, posZ + 1);
			}
			else if( position.z - radius < posZ ){ //check negative Y neighbor
				cool = cool && this.world.isValidBlock(posX + xOffset, posY, posZ  - 1) && !this.world.getBlock(posX + xOffset, posY, posZ - 1);
			}
			break;
		}

		case 1:
		{ //Y
			//determine which y direction to check
			int yOffset = 1;
			if( direction.y < 0 ) yOffset = -1;
			//check the x direction, 1 or 2 of 3 possible blocks
			cool = cool && this.world.isValidBlock(posX, posY + yOffset, posZ) && !this.world.getBlock(posX, posY + yOffset, posZ);

			if( position.x + radius  > posX ) cool = cool && this.world.isValidBlock(posX + 1, posY + yOffset, posZ) && !this.world.getBlock(posX + 1, posY + yOffset, posZ); //check positive X neighbor
			else if( position.x - radius < posX ) cool = cool && this.world.isValidBlock(posX - 1, posY + yOffset, posZ) && !this.world.getBlock(posX - 1, posY + yOffset, posZ); //check negative X neighbor

			break;
		}

		case 2:
		{ //Z
			//determine which z direction to check
			int zOffset = 1;
			if( direction.z < 0 )
				zOffset = -1;
			//check the block above or below
			cool = cool && this.world.isValidBlock(posX, posY, posZ + zOffset) && !this.world.getBlock(posX, posY, posZ + zOffset);
			//TODO: check the other blocks
			break;
		}
		default:
			break;
	}
	return cool;
}

//takes a destination, and an (dX, dY, dZ) of its base, plus a float height and radius, determines if there's a collision
//NOTE: for this method to be accurate on our grid, the maginute of the motion must be LESS THAN the radius of the player
checkStack = (dest, delta, float height, float radius) => {
	let blockStackFull = false;
	let dZtorso = (dest.y + height/2);
	let dZhead = (dest.y + height);

	if(!this.world.isValidBlock(delta.x, delta.y, delta.z) || this.world.getBlock(delta.x, delta.y, delta.z)) blockStackFull = true;
	else if(!this.world.isValidBlock(delta.x, dZtorso, delta.z) || this.world.getBlock(delta.x, dZtorso, delta.z)) blockStackFull = true;
	else if(!this.world.isValidBlock(delta.x, dZhead, delta.z) || this.world.getBlock(delta.x, dZhead, delta.z )) blockStackFull = true;

	//if this block stack is empty, there's no collision
	if(!blockStackFull) return dest;

	//otherwise we actually need to do a collision test
	let xCollide = (dest.x + radius > delta.x && dest.x - radius < delta.x + 1);
	let yCollide = (dest.z + radius > delta.z && dest.z - radius < delta.z + 1);
	//if we miss one of the easy axes, there's no collision
	if( !xCollide || !yCollide) return dest;

	//there might be a collision, so the x and y depths are now useful
	let circleXMin = dest.x - radius;
	let circleXMax = dest.x + radius;
	let xCollideStart = (circleXMin < delta.x ? delta.x : circleXMin);
	let xCollideEnd = (circleXMax > (delta.x + 1) ? (delta.x + 1) : circleXMax);
	let xDepth = xCollideEnd - xCollideStart;

	let circleYMin = dest.z - radius;
	let circleYMax = dest.z + radius;
	let yCollideStart = (circleYMin < delta.z ? delta.z : circleYMin);
	let yCollideEnd = (circleYMax > (delta.z + 1) ? (delta.z + 1) : circleYMax);
	let yDepth = yCollideEnd - yCollideStart;

	//NEED TO USE VORONOI REGIONS TO DETERMINE WHICH AXES MAKE A COLLISION

	//left side of cube
	if(dest.x < delta.x){
		//bottom grid square
		if(dest.z < delta.z){
			let BLDepth = radius - sqrt( (delta.x - dest.x)*(delta.x - dest.x) + (delta.z - dest.z)*(delta.z - dest.z) ); //bottom left
			if( (circleYMax > delta.z) && (circleXMax > dX) && (BLDepth > 0) ){
				//we collided with the BL corner of the cube, so project outward along the BL axis
				let proj = THREE.Vector2(dest.x - delta.x, dest.z - delta.z);
				proj.normalize()
				dest.x = proj.x * BLDepth; dest.z = proj.y * BLDepth;
			}
		}
		//top grid square
		else if(dest.z > delta.z + 1){
			let TLDepth = radius - sqrt( (delta.x - dest.x)*(delta.x - dest.x) + (delta.z + 1 - dest.z)*(delta.z + 1 - dest.z) ); //top left
			if( (circleYMin > delta.z + 1) && (circleXMax > delta.x)  && (TLDepth > 0) ){
				//we collided with the TL corner of the cube, so project outward along the TL axis
				let proj = THREE.Vector2(dest.x - dX, dest.z - (delta.z + 1));
				proj.normalize()
				dest.x = proj.x * TLDepth; dest.z = proj.y * TLDepth;
			}
		}
		//dest.y in cube's y-axis
		else{
			if(circleXMax > delta.x)
                dest.x -= xDepth;//we collided with the left side of the cube, so project left along the X-axis
		}
	}
	//right side of cube
	else if(dest.x > delta.x + 1){
		//bottom grid square
		if(dest.y < delta.z){
			float BRDepth = radius - sqrt( (delta.x + 1 - dest.x)*(delta.x + 1- dest.x) + (delta.z - dest.z)*(delta.z - dest.z) ); //bottom right
			if( (circleYMax > delta.z) && (circleXMin < delta.x + 1) && ( BRDepth > 0) ){
				//we collided with the BR corner of the cube, so project outward along the BR axis
				let proj = THREE.Vector2(dest.x - (delta.x + 1), dest.z);
        proj.normalize()

				dest.x = proj.x * BRDepth; dest.z = proj.y * BRDepth;
			}
		}
		//top grid square
		else if(dest.y > delta.y + 1){
			float TRDepth = radius - sqrt( (delta.x + 1 - dest.x)*(delta.x + 1- dest.x) + (delta.z + 1 - dest.y)*(delta.z + 1 - dest.y) ); //top right
			if( (circleYMin < delta.y + 1) && (circleXMin < delta.x + 1) && (TRDepth < 0) ){
				//we collided with the TR corner of the cube, so project outward along the TR axis
				Vector2D proj = THREE.Vector2(dest.x - (delta.x + 1), dest.y + (delta.z + 1));
        proj.normalize()
				dest.x = proj.x * TRDepth; dest.y = proj.y * TRDepth;
			}
		}
		//dest.y in cube's y-axis
		else{
			if( ( circleXMin < delta.x + 1) )
                dest.x += xDepth; //we collided with the right side of the cube, so project right along the X-axis
            }
	}
	//center.x in cube's x-axis
	else{
		//bottom grid square
		if(dest.y < delta.z){
			if( (circleYMax > delta.z) )
                dest.z -= yDepth; //we collided with the bottom side of the cube, so project down along the Y-axis
		}
		//top grid square
		else if(dest.z > delta.z + 1){
			if( (circleYMin < delta.z + 1) )
                dest.z += yDepth; //we collided with the top side of the cube, so project up along the Y-axis
		}
		//INSIDE the cube
		else{
			if(xDepth < yDepth){ //project out of x-axis
				if(dest.x > delta.x + .5)
					dest.x += xDepth; //right half goes right
				else
					dest.x -= xDepth;
			}
			else{
				if(dest.z > delta.z + .5)
					dest.yz+= yDepth; //top side goes up
				else
					dest.z -= yDepth;
			}
		}
	}
	return dest;
}

checkMovement2 = (pos, dir, height, radius) => {
	let posX = pos.x;
	let posY = pos.y;

	const EPSILON = 0.001f;
	let zMovement = dir.z;
	let dZ = (pos.z + dir.z);
	let zOffset = 1;

	//first, check to see if there's z movement
	if(Math.abs(dir.z) > 0){
		//then determine the correct Z-layer to test

		if(dir.z > 0)
			dZ = (pos.z + height + dir.z); //check head location
		//check the location we're in
		if( !this.world.isValidBlock(posX, posY, dZ) || this.world.getBlock(posX, posY, dZ) ){
			zMovement = (dZ + zOffset) - pos.z;
			if(dir.z > 0)
				zMovement = dZ - (pos.z + height + EPSILON);
		}
		//check the block to the right
		else if( (pos.x + radius > posX + 1) && (!this.world.isValidBlock(posX+1, posY, dZ) || this.world.getBlock(posX+1, posY, dZ)) ){

			zMovement = (dZ + zOffset) - pos.z;
			if(dir.z > 0)
				zMovement = dZ - (pos.z + height + EPSILON);
		}
		//check the block to the left
		else if( (pos.x - radius < posX) && (!this.world.isValidBlock(posX-1, posY, dZ) || this.world.getBlock(posX-1, posY, dZ)) ){

			zMovement = (dZ + zOffset) - pos.z;
			if(dir.z > 0)
				zMovement = dZ - (pos.z + height + EPSILON);
		}
		//check the block to the back
		else if( (pos.y + radius > posY + 1) && (!this.world.isValidBlock(posX, posY+1, dZ) || this.world.getBlock(posX, posY+1, dZ)) ){

			zMovement = (dZ + zOffset) - pos.z;
			if(dir.z > 0)
				zMovement = dZ - (pos.z + height + EPSILON);
		}
		//check the block to the front
		else if( (pos.y - radius < posY) && (!this.world.isValidBlock(posX, posY-1, dZ) || this.world.getBlock(posX, posY-1, dZ)) ){
			zMovement = (dZ + zOffset) - pos.z;
			if(dir.z > 0)
				zMovement = dZ - (pos.z + height + EPSILON);
		}
	}

	//correct for the actual zMovement performed
	let fdest = {pos.x + dir.x, pos.y + dir.y, pos.z + zMovement};
	let dX = fdest.x;
	let dY = fdest.y;
	dZ = fdest.z;

	//then, once moved into the z position, perform the xy-movements
	fdest = checkStack(fdest, dX, dY, dZ, height, radius); //center :: ANNOTATION IS PLAYER POSITION RELATIVE TO COLLIDING BLOCK
	if (fdest.x + radius > dX + 1){
		fdest = checkStack(fdest, dX+1, dY, dZ, height, radius); //left
		dX = fdest.x;
		dY = fdest.y;
		dZ = fdest.z;
	}
	else if( fdest.x - radius < dX ){
		fdest = checkStack(fdest, dX-1, dY, dZ, height, radius); //right BROKEN
		dX =  fdest.x;
		dY =  fdest.y;
		dZ =  fdest.z;
	}
	if( fdest.y + radius > dY + 1){
		fdest = checkStack(fdest, dX, dY+1, dZ, height, radius); //front
		dX =  fdest.x;
		dY =  fdest.y;
		dZ =  fdest.z;
    }
	else if( fdest.y - radius < dY ){
		fdest = checkStack(fdest, dX, dY-1, dZ, height, radius); //back BROKEN
		dX =  fdest.x;
		dY =  fdest.y;
		dZ =  fdest.z;
	}

	//TODO: check the diagonals too!!!
	return fdest;
}

}
