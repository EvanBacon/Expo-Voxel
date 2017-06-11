var lock = require('../index')
  , rfs = require('fullscreen')
  , pointer
  , fs

var div = document.createElement('div')

document.body.appendChild(div)

div.style.display = 'none'
div.style.position = 'absolute'
div.style.width =
div.style.height = '100px'
div.style.top = 
div.style.left = '0px'
div.style.backgroundColor = 'red'

fs = rfs(document.body) 
pointer = lock(document.body)

document.body.onkeydown = function(ev) {
  if(!pointer.target()) pointer.request()
  else pointer.release()
}

pointer.on('error', console.log.bind(console))
pointer.on('needs-fullscreen', function() {
  fs.once('attain', function() {
    pointer.request()
  })
  fs.request()
})


pointer.on('attain', function(stream) {
  var current = {x: stream.initial.x, y: stream.initial.y}
  div.style.display = 'block'
  stream
    .on('data', function(move) {
      current.x += move.dx
      current.y += move.dy
      console.log(current.x, current.y)
      div.style.left = current.x+'px'
      div.style.top = current.y+'px'
    })
})

pointer.on('release', function() {
  div.style.display = 'none'
})
