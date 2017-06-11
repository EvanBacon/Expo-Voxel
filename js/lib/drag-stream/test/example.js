var drag = require('../index')
  , el = document.getElementById('xxx')

drag(el)
  .on('data', function(x) { console.log(x) })
