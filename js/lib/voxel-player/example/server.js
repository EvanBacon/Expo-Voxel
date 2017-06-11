var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var staticDir = ecstatic(__dirname + '/static');
var textureDir = ecstatic(path.join(
    path.dirname(require.resolve('painterly-textures')),
    'textures'
));

var server = http.createServer(function (req, res) {
    if (RegExp('^/textures($|/)').test(req.url)) {
        req.url = req.url.replace(RegExp('^/textures($|/)'), '/');
        textureDir(req, res);
    }
    else staticDir(req, res);
});
server.listen(8085);
