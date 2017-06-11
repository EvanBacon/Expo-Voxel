
var assert = require('assert')
  , drag = require('../index')
  , jsdom
  , document
//, window <-- implied global

try {
  jsdom = require('jsdom')
} catch(e) {

}

var tests = [
  test_is_initially_paused
, test_drains_on_mousedown
, test_pauses_on_mouseup
, test_emits_on_mousemove
]

start()

function setup() {

}

// integration tests

function test_is_initially_paused() {
  var el = create_element(10, 10)
    , d = drag(el)

  assert.ok(d.paused) 
}

function test_drains_on_mousedown() {
  var el = create_element(100, 100)
    , d = drag(el)
    , ev = create_event('mousedown', 10, 10)
    , triggered = false

  d.once('drain', function() {
    triggered = true
  })

  assert.ok(d.paused)

  el.dispatchEvent(ev)

  assert.ok(!d.paused)
  assert.ok(triggered)
}

function test_pauses_on_mouseup() {
  var el = create_element(100, 100)
    , d = drag(el)
    , ev = create_event('mousedown', 10, 10)
    , triggered = false

  d.once('drain', function() {
    triggered = true
  })

  assert.ok(d.paused)

  el.dispatchEvent(ev)

  assert.ok(!d.paused)
  assert.ok(triggered)

  ev = create_event('mouseup', 10, 10)

  el.ownerDocument.body.dispatchEvent(ev)
  assert.ok(d.paused)
}

function test_emits_on_mousemove(ready) {
  var el = create_element(100, 100)
    , d = drag(el)
    , ev = create_event('mousedown', 10, 10)
    , triggered = false
    , data = []
    , timeout = Math.random() * 30

  d.on('data', function(datum) { data.push(datum) })

  el.dispatchEvent(ev)
  ev = create_event('mousemove', 100, 100)
  el.dispatchEvent(ev)
  ev = create_event('mousemove', 0, 0)
  setTimeout(function() {
    el.dispatchEvent(ev)
    ev = create_event('mouseup', 0, 0)
    el.dispatchEvent(ev)

    assert.equal(data.length, 4)
    assert.ok(data[data.length - 1].dt >= timeout)

    ready()
  }, timeout)

}

// utils

function create_element(w, h) {
  var element = document.createElement('div')

  document.body.appendChild(element)

  element.style.width = w+'px'
  element.style.height = h+'px'

  return element
}

function create_event(event_name, x, y) {
  var event = document.createEvent('MouseEvents')

  event.initMouseEvent(event_name, true, true, 0, 0, x, y, false, false, false, false, 0, null)

  return event
}

function out(what) {
  process.stdout.write(what)
}

// test runner

function start() {
  Function.prototype.before = function(fn) {
    var self = this
    return function ret() {
      var args = [].slice.call(arguments)

      fn.call(ret, args)

      return self.apply(this, args)
    }
  }

  if(typeof window === 'undefined') {
    return jsdom.env('<body></body>', function(err, win) {
      window = win
      document = win.document
      run()
    })
  }
  out = function(s) {
    out.buf = (out.buf || '') + s
    if(!!~s.indexOf('\n')) {
      console.log(out.buf)
      out.buf = ''
    }
  }
  document = window.document
  run()
}

function run() {
  if(!tests.length)
    return out('\n')

  var test = tests.shift()
    , now = Date.now()

  setup()

  out(test.name+' - ')
  test.length ? test(done) : (test(), done())

  function done() {
    out(''+(Date.now() - now)+'ms\n')
    run()
  }
}

