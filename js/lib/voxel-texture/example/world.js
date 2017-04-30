var tic = require('tic')();
var createGame = require('voxel-engine');

var game = createGame({
  chunkDistance: 2,
  generate: function(x, y, z) {
    return (Math.sqrt(x*x + y*y + z*z) > 20 || y*y > 10) ? 0 : (Math.random() * 3) + 1;
  },
  materials: ['brick', ['grass', 'dirt', 'grass_dirt'], 'dirt'],
  texturePath: 'textures/'
});
var container = document.getElementById('container');
game.appendTo(container);

game.addStats();

// Our texture builder
var materialEngine = game.materials;

// Give console access to game
window.game = game;

// hold the cubes we create
var cubes = [];

// create a player
var createPlayer = require('voxel-player')(game);
var shama = createPlayer('textures/shama.png');
shama.yaw.position.set(0, 10, 0);
shama.possess();

// explode voxel on click
var explode = require('voxel-debris')(game, { power : 1.5 });
game.on('fire', function(pos) {
  var pos = game.raycast(game.cameraPosition(), game.cameraVector(), 100).voxel;
  if (erase) explode(pos);
  else game.createBlock(pos, 1);
});

window.addEventListener('keydown', ctrlToggle);
window.addEventListener('keyup', ctrlToggle);

var erase = true;
function ctrlToggle (ev) { erase = !ev.ctrlKey }

game.on('tick', function(dt) {
  materialEngine.tick(dt);
  tic.tick(dt);
  cubes.forEach(function(cube, i) {
    cube.rotation.y += Math.PI / 180;
  });
});

function createCube(i, materials) {
  // create a mesh
  var obj = new game.THREE.Object3D();
  var mesh = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize),
    game.materials.material
  );
  mesh.translateY(game.cubeSize/2);
  obj.add(mesh);
  obj.position.set(3, 5, i * 2);

  // paint the mesh
  materialEngine.paint(mesh, materials);
  mesh.geometry.uvsNeedUpdate = true;

  // create a rotating jumping cube
  var cube = game.addItem({
    mesh: obj,
    size: game.cubeSize,
    velocity: {x: 0, y: 0, z: 0}
  });

  tic.interval(function() {
    cube.velocity.y += 0.03;
  }, (i * 200) + 2000);

  cubes.push(cube);
  return cube;
}

// load materials
var materials = [
  ['0'],
  ['0', '1'],
  ['0', '1', '2'],
  ['0', '1', '2', '3'],
  ['0', '1', '2', '3', '4', '5'],
  {
    top:    'grass',
    bottom: 'dirt',
    front:  'grass_dirt',
    back:   'grass_dirt',
    left:   'grass_dirt',
    right:  'grass_dirt'
  }
];
materialEngine.load(materials, function() {
  for (var i = 0; i < materials.length; i++) {
    createCube(i, materials[i]);
  }

  // load a sprite map
  materialEngine.sprite('terrain', 32, function(textures) {
    // create cubes randomly textured from the sprite map
    for (var x = 0; x < 6; x++) {
      var cube = createCube(x, textures[Math.floor(Math.random() * textures.length)]);
      cube.mesh.translateX(3);
    }

    // create animated materials
    var all = [].concat.apply([], materialEngine.materials);
    var discoCube = createCube(3, 1).mesh;
    discoCube.translateX(6);
    discoCube.children[0].mat = materialEngine.animate(discoCube.children[0], all, 100);

    var breaking = createCube(4, 1).mesh;
    breaking.translateX(6);
    breaking.children[0].mat = materialEngine.animate(breaking.children[0], [
      'terrain_0_480', 'terrain_32_480', 'terrain_64_480',
      'terrain_96_480', 'terrain_128_480', 'terrain_160_480',
      'terrain_192_480', 'terrain_224_480', 'terrain_256_480',
    ], 1000);

    var torch = createCube(5, 1).mesh;
    torch.translateX(6);
    var blank = new game.THREE.MeshLambertMaterial({transparent:true,opacity:0});
    var torchMat = materialEngine.animate(torch.children[0], [
      'terrain_96_192', 'terrain_96_224'
    ], 500);
    torch.children[0].mat = new game.THREE.MeshFaceMaterial([
      torchMat, torchMat, blank, blank, torchMat, torchMat
    ]);
  });
});
