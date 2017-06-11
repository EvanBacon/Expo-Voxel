# drag-stream

A readable stream of drag data for an element.

```javascript

var drag = require('../index')
  , el = document.getElementById('content')

drag(el)
  .on('data', function(data) {
    // data == {dx:int, dy:int, dt:int}
  })
  .pipe(
    through(function(data) {
      this.emit('data', [data.dx, data.dy, data.dt].join(', ')) 
    })
  )

```

## API

### require('drag-stream') -> drag(el)

### drag(el) -> readable stream

The stream will emit data events between a mousedown on the target `el`
and mouseup anywhere else on the page.

The data events take the form of an x-delta, y-delta, and time-delta.

When a drag is started, its time-delta will be `0` and its x and y deltas
will be the screen offset of the initial mousedown event.

