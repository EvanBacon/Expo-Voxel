module.exports = coordinates

var aabb = require('aabb-3d')
import EventEmitter from 'EventEmitter';

function coordinates(spatial, box, regionWidth) {
  this.emitter = new EventEmitter();

  var lastRegion = [NaN, NaN, NaN]
  var thisRegion

  if (arguments.length === 2) {
    regionWidth = box
    box = aabb([-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity])
  }

  spatial.on('position', box, updateRegion)

  function updateRegion(pos) {
    thisRegion = [Math.floor(pos[0] / regionWidth), Math.floor(pos[1] / regionWidth), Math.floor(pos[2] / regionWidth)]
    if (thisRegion[0] !== lastRegion[0] || thisRegion[1] !== lastRegion[1] || thisRegion[2] !== lastRegion[2]) {
      this.emitter.emit('change', thisRegion)
    }
    lastRegion = thisRegion
  }

  return this.emitter
}
