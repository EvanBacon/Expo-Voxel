# voxel-land

A terrain generator combining several landform features. Grass, dirt, stone, trees.

Trees are provided by [voxel-forest](https://github.com/deathcap/voxel-forest),
and the overall grass surface by Perlin noise (similar to [voxel-perlin-terrain](https://github.com/maxogden/voxel-perlin-terrain):

![screenshot](http://i.imgur.com/ZzVFUAj.png "Screenshot overview")

Beneath the grass is dirt, and then all chunks below are stone:

![screenshot](http://i.imgur.com/D918dUX.png "Screenshot both")

![screenshot](http://i.imgur.com/XB8k8XP.png "Screenshot mined")

## Usage

Load with [voxel-plugins](https://github.com/deathcap/voxel-plugins).
Requires the [voxel-registry](https://github.com/deathcap/voxel-registry) plugin
to be loaded as well.

voxel-land generates chunks as [ndarray](https://github.com/scijs/ndarray)s,
so it requires [voxel-engine-stackgl](https://github.com/deathcap/voxel-engine-stackgl)
(voxel-land 0.1.0 and earlier were for [voxel-engine](https://github.com/maxogden/voxel-engine)).

The voxel-engine-stackgl game options should have `generateChunks: false`. voxel-land
will listen on `game.voxel` for the `missingChunk` event and generate the new
chunks. The generator can be unregistered by disabling the plugin.

## License

MIT

