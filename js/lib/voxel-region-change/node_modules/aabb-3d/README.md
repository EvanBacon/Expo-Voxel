# aabb-3d

Axis aligned bounding boxes for fun and profit.

[![browser support](http://ci.testling.com/chrisdickinson/aabb-3d.png)](http://ci.testling.com/chrisdickinson/aabb-3d)

```javascript
var aabb = require('aabb-3d')

var bounding_box = aabb([0, 0, 0], [12, 12, 12])   // x, y, z == 0; width, height, depth == 12
  , other = aabb([10, 10, 10], [2, 2, 2])

bounding_box.intersects(other) // true
bounding_box.translate([2, 2, 2])  // moves the bounding box
bounding_box.expand(other)  // returns a new aabb that surrounds both bboxes

```

# API

### aabb = [new ]aabb([x, y, z], [w, h, d])

returns a new aabb.

### aabb.width() -> Number
### aabb.height() -> Number
### aabb.depth() -> Number
### aabb.x0()
### aabb.y0()
### aabb.x1()
### aabb.y1()
### aabb.z0()
### aabb.z1()

returns:

```
    
        x0/y1/z1---x1/y1/z1
depth->  /           /|
        /           / |
    x0/y1/z0 -- x1/y1/z0
      |           |   |
      |           | <-- height
      |           |  /
      |           | /
   x0/y0/z0 ----- x1/y0/z0
            ^
            |
          width
```

### aabb.translate([x, y, z])

moves the box. returns itself.

### aabb.intersects(aabb) -> Boolean

returns true if the two bounding boxes intersect (or touch at all.)

### aabb.union(aabb) -> new aabb or null

returns a new `aabb` representing the shared area of the
two aabb's. returns `null` if the boxes don't intersect.

# License

MIT

