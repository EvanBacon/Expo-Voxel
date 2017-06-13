# voxel-highlight

highlight the voxel the player is currently looking at, along with the
adjacent voxel (where a block would be placed) when the control key is down

```
npm install voxel-highlight
```

or just add to the package.json file of your voxel-engine project

## example

```javascript
var highlight = require('voxel-highlight')
var highlighter = highlight(game)
highlighter.on('highlight', function (voxelPosArray) {
  console.log('highlighted voxel: ' + voxelPosArray)
})
```
or using as constructor:
```javascript
var Highlight = require('voxel-highlight')
var highlighter = new Highlight(game)
```

## api and usage

### highlight(gameInstance, optionalOptions)

options can be:

```javascript
{
  frequency: how often in milliseconds to highlight, default is 100
  distance: how far in game distance things should be highlighted, default is 10
  geometry: threejs geometry to use for the highlight, default is a cubegeometry
  material: material to use with the geometry, default is a wireframe
  wireframeLinewidth: if using default material wireframe, default is 3
  wireframeOpacity: if using default material wireframe, default is 0.5
  color: highlight cube color, default is 0x000000
  animate: animate movement of highlight cuboid, default is false
  adjacentActive: function to toggle adjacent highlight, default is { return game.controls.state.alt }
  selectActive: function to toggle adjacent highlight, default is { return game.controls.state.select }
  animateFunction: function to ease position changes, see default below
}
```

Default animation function:
```javascript
  opts.animateFunction = function (position, targetPosition, deltaTime) {
    if (!position || !targetPosition || !deltaTime) return;
    var rate = 10 // speed in voxels per second
    if (Math.abs(targetPosition[0] - position.x) < 0.05
     && Math.abs(targetPosition[1] - position.y) < 0.05
     && Math.abs(targetPosition[2] - position.z) < 0.05) {
      position.set(targetPosition[0], targetPosition[1], targetPosition[2])
      return; // close enough to snap and be done
    }
    deltaTime = deltaTime / 1000 // usually around .016 seconds (60 FPS)
    position.x += rate * deltaTime * (targetPosition[0] - position.x)
    position.y += rate * deltaTime * (targetPosition[1] - position.y)
    position.z += rate * deltaTime * (targetPosition[2] - position.z)
  }
```

## events

### highlighter.on('highlight', function(voxelPosArray) {})

called when a voxel is highlighted

### highlighter.on('remove', function(voxelPosArray) {})

called when a voxel is un-highlighted

### highlighter.on('highlight-adjacent', function(voxelPosArray) {})

called when an adjacent voxel is highlighted

### highlighter.on('remove-adjacent', function(voxelPosArray) {})

called when an adjacent voxel is un-highlighted

### highlighter.on('highlight-select', funnction(selectionBounds) {}

called when a selection of more than one voxel is highlighted. selectionBounds has .start and .end position arrays

### highlighter.on('highlight-deselect', funnction(selectionBounds) {}

called when a selection of more than one voxel is no longer highlighted. selectionBounds has .start and .end position arrays

# Get the demo running on your machine

check out [voxel-hello-world](http://github.com/maxogden/voxel-hello-world) for demo usage

## license

BSD
