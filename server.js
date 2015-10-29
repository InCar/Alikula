
'use strict'

var express = require('express');
Date.prototype.toString=function(){
    var hour = this.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min = this.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec = this.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = this.getFullYear();
    var month = this.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = this.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}
/**
 *  Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// Application configuration
var config = require('./config/config');
// Construct application object
var app = express();
// Express middle settings
require('./config/middle')(app);
// Routing
require('./config/routes')(app);

// Start server
app.listen(config.port, function() {
    console.log('Message server is listening on port %d in %s mode.', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

