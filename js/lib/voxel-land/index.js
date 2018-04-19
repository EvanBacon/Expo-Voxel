var ndarray = require('ndarray');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
import ChunkGenerator from './worker';
module.exports = function(game, opts) {
  return new Land(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-recipes', 'voxel-food', 'voxel-mesher'],
  //clientOnly: true // TODO?
};

class Land extends EventEmitter {
  constructor(game, opts) {
    super();

    this.game = game;

    if (!game.plugins || !game.plugins.get('voxel-registry'))
      throw new Error('voxel-land requires voxel-registry');
    this.registry = game.plugins.get('voxel-registry');

    opts = opts || {};
    opts.seed = opts.seed || 'foo';
    opts.materials = opts.materials || undefined;

    opts.crustLower = opts.crustLower === undefined ? 0 : opts.crustLower;
    opts.crustUpper = opts.crustUpper === undefined ? 2 : opts.crustUpper;
    opts.hillScale = opts.hillScale || 20;
    opts.roughnessScale = opts.roughnessScale || 200;
    opts.populateTrees =
      opts.populateTrees !== undefined ? opts.populateTrees : true;
    opts.treesScale = opts.treesScale || 200;
    opts.treesMaxDensity =
      opts.treesMaxDensity !== undefined ? opts.treesMaxDensity : 5;
    opts.chunkSize = game.chunkSize || 32;
    opts.chunkPad = game.chunkPad | 0;

    opts.registerBlocks =
      opts.registerBlocks === undefined ? true : opts.registerBlocks;
    opts.registerItems =
      opts.registerItems === undefined ? true : opts.registerItems;
    opts.registerRecipes =
      opts.registerRecipes === undefined ? true : opts.registerRecipes;

    // can't clone types, so need to send size instead
    if (game.arrayType === Uint8Array || game.arrayType === Uint8ClampedArray)
      opts.arrayElementSize = 1;
    else if (game.arrayType === Uint16Array) opts.arrayElementSize = 2;
    else if (game.arrayType === Uint32Array) opts.arrayElementSize = 4;
    else
      throw new Error('voxel-land unknown game.arrayType: ' + game.arrayType);

    this.opts = JSON.parse(JSON.stringify(opts));

    this.enable();
  }

  enable = () => {
    this.registerBlocks();
    this.bindEvents();
  };

  disable = () => {
    this.unbindEvents();
    // TODO: unregister blocks?
  };

  registerBlocks = () => {
    if (this.opts.materials) return; // only register blocks once TODO: remove after adding unregister

    if (this.opts.registerItems) {
      this.registry.registerItem('coal', {
        itemTexture: 'i/coal',
        fuelBurnTime: 1,
      });
    }

    if (this.opts.registerBlocks) {
      this.registry.registerBlock('grass', {
        texture: ['grass_top', 'dirt', 'grass_side'],
        hardness: 1.0,
        itemDrop: 'dirt',
        effectiveTool: 'spade',
      });
      this.registry.registerBlock('dirt', {
        texture: 'dirt',
        hardness: 0.75,
        effectiveTool: 'spade',
      });
      this.registry.registerBlock('stone', {
        displayName: 'Smooth Stone',
        texture: 'stone',
        hardness: 10.0,
        itemDrop: 'cobblestone',
        effectiveTool: 'pickaxe',
        requiredTool: 'pickaxe',
      });
      this.registry.registerBlock('logOak', {
        displayName: 'Oak Wood',
        texture: ['log_oak_top', 'log_oak_top', 'log_oak'],
        hardness: 2.0,
        effectiveTool: 'axe',
        creativeTab: 'plants',
      });
      this.registry.registerBlock('cobblestone', {
        texture: 'cobblestone',
        hardness: 10.0,
        effectiveTool: 'pickaxe',
        requiredTool: 'pickaxe',
      });
      this.registry.registerBlock('oreCoal', {
        displayName: 'Coal Ore',
        texture: 'coal_ore',
        itemDrop: 'coal',
        hardness: 15.0,
        requiredTool: 'pickaxe',
      });
      this.registry.registerBlock('oreIron', {
        displayName: 'Iron Ore',
        texture: 'iron_ore',
        hardness: 15.0,
        requiredTool: 'pickaxe',
      });
      this.registry.registerBlock('brick', { texture: 'brick' }); // some of the these blocks don't really belong here..do they?
      this.registry.registerBlock('obsidian', {
        texture: 'obsidian',
        hardness: 128,
        requiredTool: 'pickaxe',
      });
      this.registry.registerBlock('leavesOak', {
        displayName: 'Oak Leaves',
        texture: 'leaves_oak',
        transparent: true,
        hardness: 0.1,
        creativeTab: 'plants',
        // if voxel-food apple is enabled, drop it when breaking laves (oak apples)
        itemDrop: this.registry.getItemProps('apple') ? 'apple' : null,
      });

      this.registry.registerBlock('logBirch', {
        texture: ['log_birch_top', 'log_birch_top', 'log_birch'],
        hardness: 2.0,
        displayName: 'Birch Wood',
        effectiveTool: 'axe',
        creativeTab: 'plants',
      }); // TODO: generate
    }

    if (this.opts.registerRecipes) {
      var recipes = this.game.plugins.get('voxel-recipes');
      if (recipes) {
        // TODO: should these be properties on voxel-registry, instead?
        recipes.thesaurus.registerName('wood.log', 'logOak');
        recipes.thesaurus.registerName('wood.log', 'logBirch');
        recipes.thesaurus.registerName('tree.leaves', 'leavesOak');
      }
    }

    // materials for passing to worker

    if (!this.opts.materials) {
      this.opts.materials = {};
      for (
        var blockIndex = 1;
        blockIndex < this.registry.blockProps.length;
        blockIndex += 1
      ) {
        var name = this.registry.getBlockName(blockIndex);
        var packedIndex = this.registry.getBlockIndex(name);
        this.opts.materials[name] = packedIndex;
      }
    }
  };

  bindEvents = () => {
    var self = this;

    let chunkGen = new ChunkGenerator(this, self.opts);
    // self.emit({cmd: 'configure', opts:self.opts});

    this.game.voxels.addListener(
      'missingChunk',
      (this.missingChunk = function(pos) {
        // console.warn("packitnsionfmd")
        // self.emit({cmd: 'generateChunk', pos:pos})
        if (chunkGen === undefined)
          throw new Error(
            'voxel-land web worker error: received "generateChunk" before "configure"',
          );
        const _chunk = chunkGen.generateChunk(pos);

        var voxels = new self.game.arrayType(_chunk.voxelBuffer);
        // var chunk = ndarray(voxels, [self.opts.chunkSize+self.opts.chunkPad, self.opts.chunkSize+self.opts.chunkPad, self.opts.chunkSize+self.opts.chunkPad]);
        let chunk = {};
        const chunkSize = 32;
        chunk.position = _chunk.position;
        chunk.dims = [chunkSize, chunkSize, chunkSize];
        chunk.voxels = voxels;
        self.game.showChunk(chunk);

        var { changes } = _chunk;
        if (changes) {
          for (var i = 0; i < changes.length; ++i) {
            var pos = changes[i][0];
            var value = changes[i][1];

            self.game.setBlock(pos, value); // TODO: faster mass edit?
            // TODO: what if pos is out of loaded chunk range? doesn't automatically load chunk; change will be lost
          }
        } else {
        }

        // var voxels = generateChunk(p, chunkSize)
        // var chunk = {
        //   position: p,
        //   dims: [chunkSize, chunkSize, chunkSize],
        //   voxels: voxels
        // }
        // game.showChunk(chunk)
      }),
    );

    // self.addListener('message', function(ev) {
    //   console.warn("thrown back", ev.data.cmd);
    //   if (ev.data.cmd === 'chunkGenerated') {

    //   } else if (ev.data.cmd === 'decorate') {
    //     var changes = ev.data.changes;
    //     for (var i = 0; i < changes.length; ++i) {
    //       var pos = changes[i][0];
    //       var value = changes[i][1];

    //       self.game.setBlock(pos, value); // TODO: faster mass edit?
    //       // TODO: what if pos is out of loaded chunk range? doesn't automatically load chunk; change will be lost
    //     }
    //   }
    // });
  };

  unbindEvents = () =>
    this.game.voxels.removeListener('missingChunk', this.missingChunk);
}
