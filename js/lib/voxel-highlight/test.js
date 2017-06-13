var opts = {
  highlightOpts: {
    color: 0xffff00,
    distance: 100,
    animate: false
  },
  generate: function (x, y, z) {
    return y % 16 ? 0 : Math.ceil(Math.random() * 2) 
  },
  keybindings: {
      'W': 'forward'
    , 'A': 'left'
    , 'S': 'backward'
    , 'D': 'right'
    , '<mouse 1>': 'fire'
    , '<mouse 2>': 'firealt'
    , '<space>': 'jump'
    , '<shift>': 'crouch'
    , '<control>': 'alt'
    , 'K': 'select'
  }
}

var game = require('voxel-hello-world')(opts)

var highlighter = game.highlighter
highlighter.on('highlight', function (voxelPos) {
  console.log(">   [" + voxelPos + "] highlighted voxel")
})
highlighter.on('remove', function (voxelPos) {
  console.log("<   [" + voxelPos + "] removed voxel highlight")
})
highlighter.on('highlight-adjacent', function (voxelPos) {
  console.log(">>  [" + voxelPos + "] highlighted adjacent")
})
highlighter.on('remove-adjacent', function (voxelPos) {
  console.log("<<  [" + voxelPos + "] removed adjacent highlight")
})
highlighter.on('highlight-select', function (selection) {
  console.log(">>> [" + selection.start + "][" + selection.end + "] highlighted selection")
})
highlighter.on('highlight-deselect', function (selection) {
  console.log("<<< [" + selection.start + "][" + selection.end + "] selection un-highlighted")
})
