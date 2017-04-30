# voxel-texture

> Add textures to an atlas and set UV mapping on geometries. Used for texturing
> in [voxel.js](http://voxeljs.com).

View [the demo](http://shama.github.com/voxel-texture).

**ATTENTION! v0.5.0 has changed dramatically. This library is no longer is
materials API but just loads textures onto an atlas and sets UV mappings.**

## example

```js
// create a material engine
var textureEngine = require('voxel-texture')({
  // a copy of your voxel.js game
  game: game,

  // path to your textures
  texturePath: 'textures/'
});

// load textures and it returns textures just loaded
textureEngine.load(['grass', 'dirt', 'grass_dirt'], function(textures) {
  // create a new mesh
  var cube = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize),
    // use the texture engine atlas material
    textureEngine.material
  );
  // paint the cube with grass on top, dirt on bottom and grass_dirt on sides
  textureEngine.paint(cube, ['grass', 'dirt', 'grass_dirt']);
});
```

## api

### `require('voxel-texture')(options)`
Returns a new texture engine instance. Must pass a copy of your voxel.js
`game`. `options` defaults to:

```js
{
  texturePath: '/textures/',
  materialParams: { ambient: 0xbbbbbb },
  materialType: THREE.MeshLambertMaterial,
  applyTextureParams: function(map) {
    map.magFilter = this.THREE.NearestFilter;
    map.minFilter = this.THREE.LinearMipMapLinearFilter;
  }
}
```

### `textureEngine.load(textures, callback)`
Loads textures onto the atlas by expanding the texture names:

```js
textureEngine.load('grass', function(textures) {
  // textures = [grass, grass, grass, grass, grass, grass]
});
```

```js
textureEngine.load(['grass', 'dirt', 'grass_dirt'], function(textures) {
  // textures = [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt]
});
```

```js
textureEngine.load([
  'obsidian',
  ['back', 'front', 'top', 'bottom', 'left', 'right'],
  'brick'
], function(textures) {
  /*
  textures = [
    obsidian, obsidian, obsidian, obsidian, obsidian, obsidian,
    back, front, top, bottom, left, right,
    brick, brick, brick, brick, brick, brick
  ]
  */
});
```

### `textureEngine.find(name)`
Finds the type of block by texture name:

```js
// Find and change the center block to grass
game.setBlock([0, 0, 0], textureEngine.find('grass'));
```

Although this is built into the voxel engine so you could just do:

```js
game.setBlock([0, 0, 0], 'grass');
```

### `textureEngine.paint(mesh, textures)`
Modifies the UV mapping of given `mesh` to the `textures` names supplied:

```js
// create a custom mesh and load all materials
var mesh = new game.THREE.Mesh(
  new game.THREE.Geometry(),
  textureEngine.material
);

// paint the geometry
textureEngine.paint(mesh, ['grass', 'dirt', 'grass_dirt']);
```

Or if you have the `face.color` set on the faces of your geometry (such as how
voxel-mesh does it) then omit the `textures` argument. It will select the
texture based on color from all the previously loaded textures:

```js
textureEngine.paint(voxelMesh);
```

### `textureEngine.sprite(name, w, h, callback)`
Create textures from a sprite map. If you have a single image with a bunch of
textures do:

```js
// load terrain.png, it is 512x512
// each texture is 32x32
textureEngine.sprite('terrain', 32, function(textures) {
  // each texture will be named: terrain_x_y
});
```

The width and height default to `16x16`.

### `textureEngine.animate(mesh, textures, delay)`
Create an animated material. A material that after each delay will paint the
mesh by iterating through `textures`. Must run `textureEngine.tick()` to
actually animate.

```js
var mesh = new game.THREE.Mesh(
  new game.THREE.Geometry(),
  new game.THREE.MeshFaceMaterial()
);
mesh.material = textureEngine.animate(mesh, ['one', 'two', 'three'], 1000);
```

### `textureEngine.tick(delta)`
Run the animations for any animated materials.

```js
game.on('tick', function(dt) {
  textureEngine.tick(dt);
});
```

## install
With [npm](http://npmjs.org) do:

```
npm install voxel-texture
```

## release history
* 0.5.6 - Add materialFlatColor option for using simple flat colors instead of textures.
* 0.5.5 - Only call document.createElement if available.
* 0.5.4 - Allow null placeholder materials.
* 0.5.3 - Force texture to dimensions that are power of 2 for mipmaps.
* 0.5.2 - Use atlaspack tilepad to avoid mipmap texture bleed.
* 0.5.1 - Fix CORS support.
* 0.5.0 - No longer a materials API. Loads textures onto an atlas and sets UV mappings.
* 0.4.0 - Add findIndex for finding block type index.
* 0.3.3 - Move three to peerDependencies. thanks @niftylettuce!
* 0.3.2 - Use face.color instead of face.vertexColors[0]
* 0.3.1 - Support for animated materials.
* 0.3.0 - refactored entire module. removed rotate. added load, get, paint, sprite methods. auto detect transparent.
* 0.2.2 - ability to set material type and params. thanks @hughsk!
* 0.2.1 - fix rotation of front and left textures when loading mesh
* 0.2.0 - ability to set multiple textures on voxel meshes
* 0.1.1 - fix texture sharpness
* 0.1.0 - initial release

## license
Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.
