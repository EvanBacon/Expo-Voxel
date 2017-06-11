# interact

A wrapper module that provides a [drag-stream](https://github.com/chrisdickinson/drag-stream) fallback for [pointer-lock](https://github.com/chrisdickinson/pointer-lock).

Handles the `requestFullScreen` pointer lock requirement of firefox.

```javascript

var interact = require('interact')

interact(document.body)
  .on('attain', function(stream) {
    // stream attained! it'll emit "move"
    // events with {dx, dy, dt} attributes.
    // it also has an `initial` member with `{x, y, t}`
    // marking the start position and start time.
    // it's readable, and it'll clean up after itself. 
  })
  .on('release', function() {
    // stream has been released -- either the user
    // left pointer-lock, or stopped dragging.
  })
  .on('opt-out', function() {
    // user opted out of pointer lock,
    // and will be using drag-stream instead.
    // you can use this event to record a preference
    // in localStorage.
  })
```

# api

### interact = require('interact')
### interact(element[, skipLock=false]) -> ee

sets a `click` listener on `element` that requests pointerLock (if `skipLock` is false and
pointerlock is available) on click. if the lock is declined (politely!) it'll switch to 
`drag-stream`-style events.

### (ee.release|ee.request|ee.destroy)()

forwards these commands to the internal handler (whether that be `pointer-lock` or `drag-stream`)
if a corresponding method exists.

### interact.pointerAvailable() -> boolean

returns whether or not pointer lock is available -- forwards from `require('pointer-lock').available()`.

### interact.fullscreenAvailable() -> boolean

returns whether or not fullscreen is available -- forwards from `require('fullscreen').available()`.

### stream.initial -> {x: int, y: int, t: timestamp int}

the initial position for streams.

## events

### ee.on('attain', function(stream) { })

a stream of movement data is ready for consumption.

`stream` is a readable stream that closes appropriately, so you don't have to clean up after it.

`stream.initial` has `{x: int, y: int, t: timestamp int}` members detailing the initial position
and time of the stream.

`stream`'s data events are in the form of `{dx: int, dy: int, dt: timedelta int}`.

when in `drag-stream` mode, these'll be emitted every time there's a `mousedown` on the target element.

in `pointer-lock` mode, it'll be emitted every time the user enters pointer lock -- that is to say, a *lot* less often.

### ee.on('release')

the last stream has been released. you shouldn't really have to do anything here -- the
stream will clean up after itself (it emits `close` and `end` events).

### ee.on('opt-out')

emitted when the `requestPointerLock` is declined by the user. use this to store a preference
to send into `interact` later down the line!

```javascript

interact(el, localStorage.getItem('no-pointer-lock'))
  .on('opt-out', function() {
    localStorage.setItem('no-pointer-lock', true)
  })

```

### stream.on('data', function(datum) { })

# license

MIT
