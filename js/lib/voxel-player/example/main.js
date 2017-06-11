var createGame = require('voxel-engine');
var game = createGame({
    generate: require('voxel').generator['Valley'],
    texturePath: '/textures/'
});
window.game = game;
game.appendTo('#container');

var createPlayer = require('../')(game);
var substack = createPlayer('substack.png');
substack.position.y = 1000;
substack.possess();

window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        substack.toggle();
    }
});
