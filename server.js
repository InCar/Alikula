
var express = require('express');
var app = express();
var config = require('./config/config');
require('./config/routes')(app);

app.get('/', function (req, res) {
    res.send('Hello World');
});

// 静态资源
app.use('/', express.static(__dirname + '/web'));

var server = app.listen(config.port, function() {
    console.log('Express server is listening on port %d in %s mode.\n', config.port, app.get('env'));
});

exports = module.exports = app;