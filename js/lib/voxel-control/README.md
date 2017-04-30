# voxel-control

manipulate [voxel-physical objects](https://github.com/chrisdickinson/voxel-physical) using
a state object. implements basic FPS controls. is a `through` stream of sorts -- it relies
on voxel-engine to call `control.tick(dt)` to start producing events. it will buffer events
when paused.

### options

```javascript
// default values are in terms of 1 voxel width
{ speed: Number(0.0032)           // starting speed
, maxSpeed: Number(0.0112)        // max speed
, jumpMaxSpeed: Number(0.016)     // max jump speed
, jumpMaxTimer: Number(200)     // maximum amount of time jump will be applied in MS
, jumpSpeed: Number(0.004)        // starting jump speed
, accelTimer: Number(200)       // time to reach full speed on X/Y
, accelerationCurve: Function() // function(current, max) -> [0-1]
                                // defaults to a sin curve.
, airControl: Boolean(true)     // can player control direction without being on the ground?
, fireRate: Number(0)           // MS between firing
, discreteFire: Boolean(false)  // does firing require mousedown -> mouseup, or can it be held?
, onfire: Function()            // function(state) -> undefined
, rotationXMax: Number(33)              // maximum x rotation in a tick
, rotationYMax: Number(33)              // maximum y rotation in a tick
, rotationZMax: Number(33)              // maximum z rotation in a tick
, rotationMax: Number(33)               // maximum rotation in a tick -- other 
                                        // rotation maximums fallback to this value
, rotationXClamp: Number(Math.PI / 2)   // clamp x rotation to +/- this value
, rotationYClamp: Number(Infinity)      // clamp y rotation to this value
, rotationZClamp: Number(0)             // clamp z rotation to this value
, rotationScale: Number(0.002) }        // constant scale of rotation events, applied during tick
```

### api

#### control(state, opts) -> Control

`state` is a state object (probably supplied by [kb-controls](https://github.com/chrisdickinson/kb-controls.git)).

`opts` is an object optionally containing any of the above. 

#### Control#target(target?) -> target

`target` is the object to be manipulated. Assumed to have `.acceleration`, `.velocity`, and `.atRestY() -> -1, 0, 1`.

if a target is passed, set control to target that argument.

return the current target.

#### Control#tick(dt) -> undefined

advance the simulation. if there are any listeners for `'data'`, it will either buffer or emit a data event containing the control state at this tick.

### interactStream.pipe(controls) -> controls

[the interact module](https://github.com/chrisdickinson/interact) emits dx/dy/dz modifications from mouse movements / pointer lock; it can be piped to this stream.

# license

MIT
