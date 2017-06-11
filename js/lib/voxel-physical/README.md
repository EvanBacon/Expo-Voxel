# voxel-physical

create voxel-js objects that are affected by physics!

```javascript
// typical usage:
var game = require('voxel-engine')({})
  , object = new THREE.Mesh()

var physics = game.makePhysical(object)
game.addItem(physics)
game.scene.add(object)

// direct usage:
var physical = require('voxel-physical')

var physics = physical(
    object
  , game.potentialCollisionSet()    // list of objects providing a `collide(otherObject, otherBBox, desiredVector, resting map)
 
  , new THREE.Vector3(10, 10, 10)   // how big am i? w/h/d
  , new THREE.Vector3(30, 5.6, 30)  // what's my terminal velocity?
) 

game.addItem(physics)
game.scene.add(object) 

```

## API

#### physics.aabb() -> aabb-3d instance

Create a bounding box for the physics.

#### physics.subjectTo(vec3 force) -> physics

State that the object is subject to this force every frame -- i.e., gravity.

#### physics.avatar -> THREE.Mesh / THREE.Object3D

The target of the physics. All physics are applied in this object's world space (so,
if you have a player, they're comprised of `yaw`, `pitch`, and `roll` Object3D instances along with
meshes -- `roll` and `pitch` are contained by `yaw`, so `yaw` is the outermost object in this
case.)

#### physics.resting -> {x: [-1, 0, 1], y: [-1, 0, 1], z: [-1, 0, 1]}
#### physics.atRestX() -> [-1, 0, 1]
#### physics.atRestY() -> [-1, 0, 1]
#### physics.atRestZ() -> [-1, 0, 1]

Describes each of the **local** axises and whether or not the object is resting in that **local** axis (and in what direction).

#### physics.acceleration -> THREE.Vector3

The avatar's current acceleration in local space (or change in velocity over a frame).

#### physics.velocity -> THREE.Vector3

The avatar's current velocity in local space (or change in position over a frame).

#### physics.friction -> THREE.Vector3

The degree by which to scale velocity on each axis for a given frame. Reset to `1.0` during
`physics.tick(dt)` before the collisions for this frame are calculated and applied. Colliding
objects may change the object's friction in any one of the axises during their `collide` call.

#### physics.tick(dt)

Called by `voxel-engine`.

For each axis, acceleration is calculated (`accel/8 + forces.x`); acceleration is applied to
velocity (`(velocity + accel) / friction`), and a desired local vector is created from velocity
(`vel > terminal ? terminal : val`).

Then a world desired vector is created from that local desired vector. Friction is reset to `1.0`.
Resting state for all axis is reset to `0`. Then, the potential collision set is iterated, and those
calls receive the physics object, the world desired vector, the current bounding box, and the current resting state, and are **expected to modify these variables when there is a collision** (i.e., when we
collide with terrain, the friction is modified on opposite axes from the collision; we set the resting
state of the object on the colliding axis to the "direction" of impact, and we modify the desired world vector to implement the collision).


### tiny tips

* Don't modify `physics.avatar.position` directly! Prefer to modify the `acceleration` or `velocity` -- this gives you much more realistic looking motion.

* Remember, all of the force/accel/velocity/friction/resting states are **in local space**, not world space. Collisions happen in **world space**. You have to translate back to **local space** to apply changes.

As a concrete example, the voxel avatar's player is governed by a physics object attached to the `yaw` (the rotation around the Y axis -- looking left and right). So, our physics attributes look like this:

````
local space                 world space
                             
      -z                      -lz    +lx 
      ^                         \  /
      |                          \/
-x <-----> +x                    /\
      |                         /  \
      V                      -lx    +lz 
      +z
````

Which is to say, the rotation of `yaw` affects the world vectors described by the local physical attributes of your player!

* Use `voxel-control` to implement AI/etc. Instead of describing motion in terms of movements, you can
describe motion in terms of `state.forward = true`, etc, over several frames.

# LICENSE

MIT
