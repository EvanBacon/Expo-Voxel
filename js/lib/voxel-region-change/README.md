# voxel-region-change

get events when the player changes voxels or chunks

```
npm install voxel-region-change
```

## usage

```javascript
var regionChange = require('voxel-region-change')
```

## regionChange(spatialEE, aabb3D, regionWidth)

where `spatialEE` is a [spatial event emitter](http://github.com/chrisdickinson/spatial-events), `aabb3D` is a [aabb-3d](http://github.com/chrisdickinson/aabb-3d) and `regionWidth` is some number

`box` is optional and will default to `aabb3d([-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity])`

## regionChangeInstance.on('change', function(pos) {})

this will emit each time the spatial event emitter emits a region that is beyond your regionWidth. it will emit a position object with x, y and z equal to `[Math.floor(pos.x / regionWidth), Math.floor(pos.y / regionWidth), Math.floor(pos.z / regionWidth)]`

## license

BSD