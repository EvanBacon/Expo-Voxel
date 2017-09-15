//'use strict'; // TODO

var ever = require('ever');
var createTree = require('voxel-trees');
var SimplexNoise = require('simplex-noise');
var Alea = require('alea');
var ndarray = require('ndarray');
var ops = require('ndarray-ops');

function ChunkGenerator(worker, opts) {
  this.worker = worker;
  this.opts = opts;

  var random = this.random = new Alea(this.opts.seed);

  var randomHills = new Alea(random());
  var randomRoughness = new Alea(random());
  var randomTrees = new Alea(random());

  this.noiseHills = new SimplexNoise(function() { return randomHills(); });
  this.noiseRoughness = new SimplexNoise(function() { return randomRoughness(); });
  this.noiseTrees = new SimplexNoise(function() { return randomTrees(); });

  this.populators = [];

  // TODO: maybe run ore loops once, _then_ choose ore type? for efficiency
  this.registerPopulator(this.populateCoalOre.bind(this));
  this.registerPopulator(this.populateIronOre.bind(this));

  return this;
};

// calculate terrain height based on perlin noise 
// see @maxogden's voxel-perlin-terrain https://github.com/maxogden/voxel-perlin-terrain
ChunkGenerator.prototype.generateHeightMap = function(position, width) {
  var startX = position[0] * width;
  var startY = position[1] * width;
  var startZ = position[2] * width;
  var heightMap = new Uint8Array(width * width);

  for (var x = startX; x < startX + width; x++) {
    for (var z = startZ; z < startZ + width; z++) {

      // large scale ruggedness of terrain
      var roughness = this.noiseRoughness.noise2D(x / this.opts.roughnessScale, z / this.opts.roughnessScale);
      roughnessTerm = Math.floor(Math.pow(scale(roughness, -1, 1, 0, 2), 5));

      // smaller scale local hills
      var n = this.noiseHills.noise2D(x / this.opts.hillScale, z / this.opts.hillScale);
      var y = ~~scale(n, -1, 1, this.opts.crustLower, this.opts.crustUpper + roughnessTerm);
      if (roughnessTerm < 1) y = this.opts.crustLower; // completely flat ("plains")
      //y = roughnessFactor; // to debug roughness map

      if (y === this.crustLower || startY < y && y < startY + width) {
        var xidx = Math.abs((width + x % width) % width);
        var yidx = Math.abs((width + y % width) % width);
        var zidx = Math.abs((width + z % width) % width);
        var idx = xidx + yidx * width + zidx * width * width;
        heightMap[xidx + zidx * width] = yidx;
      }
    }
  }

  return heightMap;
};

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow;
}

ChunkGenerator.prototype.registerPopulator = function(f) {
  this.populators.push(f);
};


// Add per-chunk features
// Mutate voxels array
ChunkGenerator.prototype.populateChunk = function(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels) {
  // populate chunk with features that don't need to cross chunks TODO: customizable, plugin-based
  //console.log('populating chunk '+[chunkX,chunkY,chunkZ,voxels].join(' '));

  for (var i = 0; i < this.populators.length; i += 1) {
    var populate = this.populators[i];

    populate(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels);
  }
};

ChunkGenerator.prototype.populateOreClusters = function(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels, clustersPerChunk, clusterSize, replaceMaterial, oreMaterial) {
  // ores
  var width = this.opts.chunkSize;
  var nextInt = function(max) {
    return Math.round(random() * max);
  };

  for (var i = 0; i < clustersPerChunk; i += 1) {
    var x = nextInt(width - 1);
    var y = nextInt(width - 1);
    var z = nextInt(width - 1);

    // replace stone with ore
    for (var j = 0; j < clusterSize; j += 1) {
      if (voxels.get(x, y, z) === replaceMaterial) {
        voxels.set(x, y, z, oreMaterial);
        //console.log('ore gen at '+[chunkX * width + x, chunkY * width + y, chunkZ * width + z].join(' '));
      }

      // TODO: better clusters, and other distributions - see http://www.minecraftforum.net/topic/1107057-146v2-custom-ore-generation-updated-jan-5th/ 
      // and http://customoregen.shoutwiki.com/wiki/Category:Distributions http://www.minecraftforge.net/wiki/Tutorials/Ore_Generation
      // 'elliptic?'
   
      // currently, randomly branches, but might loop on itself
      x += nextInt(2) - 1
      y += nextInt(2) - 1

      // wrap TODO: truncate instead?
      x %= width - 1;
      y %= width - 1;
    }
  }
};

// TODO: refactor, and make more generic enough that external plugins can register

ChunkGenerator.prototype.populateCoalOre = function(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels) {
  var nextInt = function(max) {
    return Math.round(random() * max);
  };

  var clustersPerChunk = 3;
  var clusterSize = nextInt(100) + 50;
  var replaceMaterial = this.opts.materials.stone;

  this.populateOreClusters(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels, clustersPerChunk, clusterSize, replaceMaterial, this.opts.materials.oreCoal);
};

ChunkGenerator.prototype.populateIronOre = function(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels) {
  var nextInt = function(max) {
    return Math.round(random() * max);
  };

  var clustersPerChunk = 2;
  var clusterSize = nextInt(30) + 10;
  var replaceMaterial = this.opts.materials.stone;

  this.populateOreClusters(random, chunkX, chunkY, chunkZ, chunkHeightMap, voxels, clustersPerChunk, clusterSize, replaceMaterial, this.opts.materials.oreIron);
};


// Add possibly-cross-chunk features, with global world coordinates (slower)
// Return list of changes to voxels to make
ChunkGenerator.prototype.decorate = function(random, chunkX, chunkY, chunkZ, chunkHeightMap) {
  var changes = [];
  var width = this.opts.chunkSize;
  var startX = chunkX * width;
  var startY = chunkY * width;
  var startZ = chunkZ * width;

  // TODO: iterate list of 'decorators'

  // "craters" (TODO: fill with water to make lakes)
  if (random() < 0.30) {
    var radius = ~~(random() * 10);
    for (var dx = -radius; dx <= radius; ++dx) {
      for (var dy = -radius; dy <= radius; ++dy) {
        for (var dz = -radius; dz <= radius; ++dz) {
          var distance = Math.sqrt(dx*dx + dy*dy + dz*dz); // TODO: better algorithm
          if (distance < radius)
            changes.push([[startX+dx, startY+dy, startZ+dz], 0]);
        }
      }
    }
    return changes; // don't generate trees on top TODO: smarter - update heightmap maybe
  }

  // trees
  if (!this.opts.populateTrees) 
    return;

  // TODO: large-scale biomes, with higher tree density? forests
  var treeCount = ~~scale(this.noiseTrees.noise2D(chunkX / this.opts.treesScale, chunkZ / this.opts.treesScale), -1, 1, 0, this.opts.treesMaxDensity);

  for (var i = 0; i < treeCount; ++i) {
    // scatter randomly around chunk
    var dx = ~~scale(random(), 0, 1, 0, width - 1);
    var dz = ~~scale(random(), 0, 1, 0, width - 1);

    // position at top of surface 
    var dy = chunkHeightMap[dx + dz * width] + 1;

    var n = random();
    var treeType;
    if (n < 0.05)
      treeType = 'guybrush';
    //else if (n < 0.20)
    //  treeType = 'fractal';  // too weird
    else
      treeType = 'subspace';

    createTree({ 
      random: random,
      bark: this.opts.materials.logOak,
      leaves: this.opts.materials.leavesOak,
      position: {x:startX + dx, y:startY + dy, z:startZ + dz},
      treeType: treeType,
      setBlock: function (pos, value) {
        changes.push([[pos.x, pos.y, pos.z], value]);
        return false;  // returning true stops tree
      }
    });
  }


  return changes;
};

ChunkGenerator.prototype.generateChunk = function(pos) {
  var width = this.opts.chunkSize;
  var pad = this.opts.chunkPad;
  var arrayType = {1:Uint8Array, 2:Uint16Array, 4:Uint32Array}[this.opts.arrayElementSize];

  // create underlying array padded 2 voxels on each edge, but also an unpadded view for populating
  var buffer = new ArrayBuffer((width+pad) * (width+pad) * (width+pad) * this.opts.arrayElementSize);
  var voxelsPadded = ndarray(new arrayType(buffer), [width+pad, width+pad, width+pad]);
  var h = pad >> 1;
  var voxels = voxelsPadded.lo(h,h,h).hi(width,width,width);

  var changes = undefined;

  /* to prove this code truly is running asynchronously
  var i=0;
  console.log('lag');
  while(i<1000000000)
    i++;
  console.log('lag done');
  */

  /* to generate only specific chunks for testing
  var cstr = pos[0] + ',' + pos[2];
  var okc = [ 
"-1,-1",
"0,0"];
  if (okc.indexOf(cstr) == -1) return;
  */

  if (pos[1] === 0) {
    // ground surface level
    var heightMap = this.generateHeightMap(pos, width);

    for (var x = 0; x < width; ++x) {
      for (var z = 0; z < width; ++z) {
        var y = heightMap[x + z * width];

        //y=1;voxels.set(x,y,z, (pos[0]+pos[2]) & 1 ? this.opts.materials.oreCoal : this.opts.materials.oreIron); continue; // flat checkerboard for testing chunk boundaries

        // dirt with grass on top
        voxels.set(x,y,z, this.opts.materials.grass);
        while(y-- > 0)
          voxels.set(x,y,z, this.opts.materials.dirt);

      }
    }
    // features
    var random = new Alea(pos[0] + pos[1] * width + pos[2] * width * width); // TODO: sufficient?
    this.populateChunk(random, pos[0], pos[1], pos[2], heightMap, voxels);
    changes = this.decorate(random, pos[0], pos[1], pos[2], heightMap); // TODO: should run in another worker, to not block terrain gen?
  } else if (pos[1] > 0) {
    // empty space above ground
    // TODO: clouds, other above-ground floating structures? https://github.com/deathcap/voxel-land/issues/6
  } else {
    //this.opts.materials.stone=0; // debug ore gen
    // below ground - starts out as all stone
    ops.assigns(voxels, this.opts.materials.stone);

    var random = new Alea(pos[0] + pos[1] * width + pos[2] * width * width); // TODO: refactor with above
    this.populateChunk(random, pos[0], pos[1], pos[2], null, voxels);
  }

  //if (pos.join('|') !== '0|0|0' && pos.join('|') !== '0|-1|0') return; // only a few chunks for testing

  this.worker.postMessage({cmd: 'chunkGenerated', position: pos, voxelBuffer: buffer}, [buffer]);

  // add additional decoration edits, which may span multiple loaded chunks
  if (changes) this.worker.postMessage({cmd: 'decorate', changes:changes}); // TODO: use transferrable?
};

module.exports = function() {
  var gen;
  ever(this).on('message', function(ev) {

    if (ev.data.cmd === 'configure') {
      gen = new ChunkGenerator(this, ev.data.opts);
    } else if (ev.data.cmd === 'generateChunk') {
      if (gen === undefined) throw new Error('voxel-land web worker error: received "generateChunk" before "configure"');
      gen.generateChunk(ev.data.pos);
    }
  });
};


