var interact = require('../index')

var ctl = interact(document.body)
  , pre = document.getElementById('output')

ctl.on('attain', function(stream) {
  var pos = {
      x: stream.initial.x
    , y: stream.initial.y
    , t: stream.initial.t
  }
  stream.on('data', function(move) {
    pos.x += move.dx
    pos.y += move.dy
    pos.t += move.dt

    pre.innerHTML = pos.x+', '+pos.y+', '+pos.t
  })
})
