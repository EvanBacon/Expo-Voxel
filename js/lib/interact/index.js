var lock = require('pointer-lock')
  , drag = require('drag-stream')
  , full = require('fullscreen')

var EE = require('EventEmitter')
  , Stream = require('stream').Stream

module.exports = interact

function interact(el, skiplock) {
  var ee = new EE
    , internal

  if(!lock.available() || skiplock) {
    internal = usedrag(el)
  } else {
    internal = uselock(el, politelydeclined)
  }

  ee.release = function() { internal.release && internal.release() }
  ee.request = function() { internal.request && internal.request() }
  ee.destroy = function() { internal.destroy && internal.destroy() }
  ee.pointerAvailable = function() { return lock.available() }
  ee.fullscreenAvailable = function() { return full.available() }

  forward()

  return ee

  function politelydeclined() {
    ee.emit('opt-out')
    internal.destroy()
    internal = usedrag(el)
    forward()
  }

  function forward() {
    internal.on('attain', function(stream) {
      ee.emit('attain', stream)
    })

    internal.on('release', function() {
      ee.emit('release')
    })
  }
}

function uselock(el, declined) {
  var pointer = lock(el)
    , fs = full(el)

  pointer.on('needs-fullscreen', function() {
    fs.once('attain', function() {
      pointer.request()
    })
    fs.request()
  })

  pointer.on('error', declined)

  return pointer
}

function usedrag(el) {
  var ee = new EE
    , d = drag(el)
    , stream

  d.paused = true

  d.on('resume', function() {
    stream = new Stream
    stream.readable = true
    stream.initial = null
  })

  d.on('data', function(datum) {
    if(!stream) {
      stream = new Stream
      stream.readable = true
      stream.initial = null
    }

    if(!stream.initial) {
      stream.initial = {
        x: datum.dx
      , y: datum.dy
      , t: datum.dt
      }
      return ee.emit('attain', stream)
    }

    if(stream.paused) {
      ee.emit('release')
      stream.emit('end')
      stream.readable = false
      stream.emit('close')
      stream = null
    }

    stream.emit('data', datum)
  })

  return ee
}
