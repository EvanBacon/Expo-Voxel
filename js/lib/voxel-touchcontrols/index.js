module.exports = function(state) {
  // var ul = el.getElementsByTagName('ul')[0]
  var lastFlags = []
  var controlsTouch = -1
  var containerTouch = {"id":-1, "x":-1, "y":-1}


  // el.addEventListener('touchstart', onTouchStart)
  // el.addEventListener('touchmove', onTouchMove)
  // el.addEventListener('touchend', onTouchEnd)
  // container.addEventListener('touchstart', startTouchContainer)
  // container.addEventListener('touchmove', handleTouchContainer)
  // container.addEventListener('touchend', unTouchContainer)
  this.onTouchStart = (event) => {
    if (controlsTouch === -1) {
      controlsTouch = event.touches[0].identifier
    }
    this.onTouchMove(event)
  }
  this.onTouchMove = (event) => {
    var touch = null
    if (event.touches.length > 1) {
      for (t in event.touches) {
        if (event.touches[t].identifier === controlsTouch) {
          touch = event.touches[t]
          break
        }
      }
    } else {
      touch = event.touches[0]
    }
    if (touch === null) return
    var top=touch.clientY
    var left=touch.clientX
    var flags=[]
    if (top < 50) flags.push('forward')
    if (left < 50 && top < 100) flags.push('left')
    if (left > 100 && top < 100) flags.push('right')
    if (top > 100 && left > 50 && left < 100) flags.push('backward')
    if (top > 50 && top < 100 && left > 50 && left < 100) flags.push('jump')

    if (flags.indexOf('jump') === -1) {
      for (flag in lastFlags) {
        if (flags.indexOf(lastFlags[flag]) !== -1) {
          lastFlags.splice(flag, 1)
        }
      }
      setState(lastFlags, 0)
      setState(flags, 1)
      lastFlags = flags
    } else if (lastFlags.indexOf('jump') === -1) {
      // Start jumping (in additional to existing movement)
      lastFlags.push('jump')
      setState(['jump'], 1)
    }
  }
  this.onTouchEnd = () => {
    setState(lastFlags, 0)
    lastFlags = []
    controlsTouch = -1
  }
  function setState(states, value) {
    var delta = {}
    for(s in states) {
      delta[states[s]] = value
    }
    state.write(delta)
  }
  function startTouchContainer(event) {
    if (containerTouch.id === -1) {
      containerTouch.id = event.touches[0].identifier
      containerTouch.x = event.touches[0].clientX
      containerTouch.y = event.touches[0].clientY
    }
    handleTouchContainer(event)
  }
  function handleTouchContainer(event) {
    
    var touch = null, x = y = -1, delta = {}
    for (t in event.touches) {
      if (event.touches[t].identifier === containerTouch.id) {
        touch = event.touches[t]
        break
      }
    }
    if (touch === null) return
    dx = containerTouch.x - touch.clientX
    dy = containerTouch.y - touch.clientY

    delta.x_rotation_accum = dy * 2
    delta.y_rotation_accum = dx * 8
    state.write(delta)

    containerTouch.x = touch.clientX
    containerTouch.y = touch.clientY
  }
  function unTouchContainer(event) {
    containerTouch = {"id":-1, "x":-1, "y":-1}
  }
}
