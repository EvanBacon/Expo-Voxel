# minecraft-skin

load minecraft skins as meshes in three.js applications

originally written by @daniel_hede for [this awesome demo](http://djazz.mine.nu/apps/MinecraftSkin/), turned into a module and upgraded to r54 by @maxogden

minecraft is property of Mojang AB

```javascript
var skin = require('minecraft-skin')
var viking = skin(THREE, 'viking.png')
viking.mesh.position.y = 50
scene.add(viking.mesh)
```

designed for use with [browserify](http://browserify.org)

# license

BSD