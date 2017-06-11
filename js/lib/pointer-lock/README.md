# pointer-lock

pointer-lock api exposed as an event emitter that emits readable streams
of mouse movement data. automatically handles adding appropriate mousedown/up
event listeners on the targeted element. tries to reuse objects instead of creating
new objects, to keep garbage generation low. may sing you songs, if you're nice
enough to it.

```javascript
var lock = require('pointer-lock')
  , my_element = document.getElementById('element')

if(!lock.available())
  return alert('not available!')

// my_element can be any element currently attached to
// the document -- but not the document itself (document.body on down
// is fine.)
var pointer = lock(my_element)

pointer.on('attain', function(movements) {
  var initial = {x: movements.x, y: movements: y}

  // movements is a readable stream
  movements.on('data', function(move) {
    // be sure to copy the data *out of* move,
    // as the move object is reused.
    initial.x += move.dx
    initial.y += move.dy
    initial.t += move.dt
  })

  movements.on('close', function() {
    // no more movements from this pointer-lock session.
  })
})

pointer.on('release', function() {
  // pointer has been released
})

pointer.on('error', function() {
  // user denied pointer lock OR it's not available
})

pointer.on('needs-fullscreen', function() {
  // some browsers require you to be in fullscreen mode
  // for pointer lock.
  // this lets you catch that case and request it after
  // you've requested fullscreen.
  var fullscreen = require('fullscreen')
    , fs = fullscreen(my_element)

  fs.once('attain', function() {
    // manually re-request pointer lock
    pointer.request()
  })

  // request fullscreen!
  fs.request()
})

// request pointer lock: warning, may require being called from a mouse event listener
pointer.request()

// releases the pointer lock session, if any.
pointer.release()

// current pointer lock element, if any.
pointer.target()

// remove the mouse event listeners added by lock
pointer.destroy()

```

# license

MIT
