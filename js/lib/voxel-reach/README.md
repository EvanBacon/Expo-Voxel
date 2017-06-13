# voxel-reach

A simple module for voxel-engine to listen for fire/firealt events, raycast the voxel within
reach, and send mining/interact events for the hit voxel.

Used by:

* [voxel-mine](https://github.com/deathcap/voxel-mine): handles 'mining' events
* [voxel-use](https://github.com/deathcap/voxel-use): handles 'use' events

## Installation

    npm install voxel-reach

## Example 

    var createReach = require('voxel-reach');

    reach = createReach(game, {reachDistance: 8});

    reach.on('use', function(target) { 
      if (target)
        game.createBlock(target.adjacent, 1);
    });

    reach.on('mining', function(target) { 
      if (target)
        game.setBlock(target.voxel, 0);
    });

## License

MIT
