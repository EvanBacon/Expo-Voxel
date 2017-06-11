module.exports = physical

var aabb = require('aabb-3d')
  , THREE = require('three')

function physical(avatar, collidables, dimensions, terminal) {
  return new Physical(avatar, collidables, dimensions, terminal)
}

function Physical(avatar, collidables, dimensions, terminal) {
  this.avatar = avatar
  this.terminal = terminal || new THREE.Vector3(0.9, 0.1, 0.9)
  this.dimensions = dimensions = dimensions || [1, 1, 1]
  this._aabb = aabb([0, 0, 0], dimensions)
  this.resting = {x: false, y: false, z: false}
  this.old_resting_y = 0
  this.last_rest_y = NaN

  this.collidables = collidables
  this.friction = new THREE.Vector3(1, 1, 1)

  this.rotation = this.avatar.rotation
  this.default_friction = 1

  // default yaw/pitch/roll controls to the avatar
  this.yaw =
  this.pitch =
  this.roll = avatar

  this.forces = new THREE.Vector3(0, 0, 0)
  this.attractors = []
  this.acceleration = new THREE.Vector3(0, 0, 0)
  this.velocity = new THREE.Vector3(0, 0, 0)
}

var cons = Physical
  , proto = cons.prototype
  , axes = ['x', 'y', 'z']
  , abs = Math.abs

// make these *once*, so we're not generating
// garbage for every object in the game.
var WORLD_DESIRED = new THREE.Vector3(0, 0, 0)
  , DESIRED = new THREE.Vector3(0, 0, 0)
  , START = new THREE.Vector3(0, 0, 0)
  , END = new THREE.Vector3(0, 0, 0)
  , DIRECTION = new THREE.Vector3()
  , LOCAL_ATTRACTOR = new THREE.Vector3()
  , TOTAL_FORCES = new THREE.Vector3()

proto.applyWorldAcceleration = applyTo('acceleration')
proto.applyWorldVelocity = applyTo('velocity')

function applyTo(which) {
  return function(world) {
    var local = this.avatar.worldToLocal(world)
    this[which].x += local.x
    this[which].y += local.y
    this[which].z += local.z
  }
}

proto.tick = function(dt) {
  var forces = this.forces
    , acceleration = this.acceleration
    , velocity = this.velocity
    , terminal = this.terminal
    , friction = this.friction
    , desired = DESIRED
    , world_desired = WORLD_DESIRED
    , bbox
    , pcs
  TOTAL_FORCES.multiplyScalar(0)

  desired.x =
  desired.y =
  desired.z =
  world_desired.x =
  world_desired.y =
  world_desired.z = 0

  for(var i = 0; i < this.attractors.length; i++) {
    var distance_factor = this.avatar.position.distanceToSquared(this.attractors[i])
    LOCAL_ATTRACTOR.copy(this.attractors[i])
    LOCAL_ATTRACTOR = this.avatar.worldToLocal(LOCAL_ATTRACTOR)

    DIRECTION.sub(LOCAL_ATTRACTOR, this.avatar.position)

    DIRECTION.divideScalar(DIRECTION.length() * distance_factor)
    DIRECTION.multiplyScalar(this.attractors[i].mass)

    TOTAL_FORCES.addSelf(DIRECTION)
  }
  
  if(!this.resting.x) {
    acceleration.x /= 8 * dt
    acceleration.x += TOTAL_FORCES.x * dt
    acceleration.x += forces.x * dt

    velocity.x += acceleration.x * dt
    velocity.x *= friction.x

    if(abs(velocity.x) < terminal.x) {
      desired.x = (velocity.x * dt)
    } else if(velocity.x !== 0) {
      desired.x = (velocity.x / abs(velocity.x)) * terminal.x
    }
  } else {
    acceleration.x = velocity.x = 0
  }
  if(!this.resting.y) {
    acceleration.y /= 8 * dt
    acceleration.y += TOTAL_FORCES.y * dt
    acceleration.y += forces.y * dt

    velocity.y += acceleration.y * dt
    velocity.y *= friction.y

    if(abs(velocity.y) < terminal.y) {
      desired.y = (velocity.y * dt)
    } else if(velocity.y !== 0) {
      desired.y = (velocity.y / abs(velocity.y)) * terminal.y
    }
  } else {
    acceleration.y = velocity.y = 0
  }
  if(!this.resting.z) {
    acceleration.z /= 8 * dt
    acceleration.z += TOTAL_FORCES.z * dt
    acceleration.z += forces.z * dt

    velocity.z += acceleration.z * dt
    velocity.z *= friction.z

    if(abs(velocity.z) < terminal.z) {
      desired.z = (velocity.z * dt)
    } else if(velocity.z !== 0) {
      desired.z = (velocity.z / abs(velocity.z)) * terminal.z
    }
  } else {
    acceleration.z = velocity.z = 0
  }

  START.copy(this.avatar.position)
  this.avatar.translateX(desired.x)
  this.avatar.translateY(desired.y)
  this.avatar.translateZ(desired.z)
  END.copy(this.avatar.position)
  this.avatar.position.copy(START)
  world_desired.x = END.x - START.x
  world_desired.y = END.y - START.y
  world_desired.z = END.z - START.z
  this.friction.x =
  this.friction.y =
  this.friction.z = this.default_friction

  // save old copies, since when normally on the
  // ground, this.resting.y alternates (false,-1)
  this.old_resting_y = (this.old_resting_y << 1) >>> 0
  this.old_resting_y |= !!this.resting.y | 0

  // run collisions
  this.resting.x =
  this.resting.y =
  this.resting.z = false

  bbox = this.aabb()
  pcs = this.collidables

  for(var i = 0, len = pcs.length; i < len; ++i) {
    if(pcs[i] !== this) {
      pcs[i].collide(this, bbox, world_desired, this.resting)
    }
  }

  // fall distance
  if(!!(this.old_resting_y & 0x4) !== !!this.resting.y) {
    if(!this.resting.y) {
      this.last_rest_y = this.avatar.position.y
    } else if(!isNaN(this.last_rest_y)) {
      this.fell(this.last_rest_y - this.avatar.position.y)
      this.last_rest_y = NaN
    }
  }

  // apply translation
  this.avatar.position.x += world_desired.x
  this.avatar.position.y += world_desired.y
  this.avatar.position.z += world_desired.z
}

proto.subjectTo = function(force) {
  this.forces.x += force[0]
  this.forces.y += force[1]
  this.forces.z += force[2]
  return this
}

proto.removeForce = function(force) {
  this.forces.x -= force[0]
  this.forces.y -= force[1]
  this.forces.z -= force[2]
  return this
}

proto.attractTo = function(vector, mass) {
  vector.mass = mass
  this.attractors.push(vector)
}

proto.aabb = function() {
  var pos = this.avatar.position
  var d = this.dimensions
  return aabb(
    [pos.x - (d[0]/2), pos.y, pos.z - (d[2]/2)],
    this.dimensions
  )
}

// no object -> object collisions for now, thanks
proto.collide = function(other, bbox, world_vec, resting) {
  return
}

proto.atRestX = function() {
  return this.resting.x
}

proto.atRestY = function() {
  return this.resting.y
}

proto.atRestZ = function() {
  return this.resting.z
}

proto.fell = function(distance) {
  return
}
