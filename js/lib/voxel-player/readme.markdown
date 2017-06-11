# voxel-player

Create a skinnable player with physics enabled.

# example

``` js
var createGame = require('voxel-engine');
var game = createGame({
    generate: require('voxel').generator['Valley'],
    texturePath: '/textures/'
});
window.game = game;
game.appendTo('#container');

var createPlayer = require('voxel-player')(game);
var substack = createPlayer('substack.png');
substack.possess();

window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        substack.toggle();
    }
});
```

# methods

``` js
var voxelPlayer = require('voxel-player')
```

## var createPlayer = voxelPlayer(game)

Return a function `createPlayer` from a
[voxel-engine](https://github.com/maxogden/voxel-engine) `game` instance.

## var player = createPlayer(img)

Return a new player from a image file src string `img`.

## player.position.set(x, y, z)

Set the player position.

## player.subjectTo(forceVector)

Subject the player to a force of gravity or some such. The default value is
a THREE.Vector3 with `{ x: 0, y: -0.00009, z: 0 }`.

## player.move(x, y, z) or player.move(vec)

Move a relative amount with `(x, y, z)` or a THREE.Vector3 `vec`.

## player.moveTo(x, y, z) or player.move(pos)

Move to an absolute position with `(x, y, z)` or a THREE.Vector3 `pos`.

## player.pov(view)

Set the player view type to `'first'` or `'third'` person perspective. You can
also use a number: `1` or `3`.

## player.toggle()

Toggle the player pov between 1st and 3rd.

## player.possess()

Set the player as the active camera view.

# install

With [npm](https://npmjs.org) do:

```
npm install voxel-player
```

# license

MIT
