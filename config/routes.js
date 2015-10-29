'use strict';

var dis = require('../src/dispatcher');

module.exports = function(app) {
    app.post('/message/send/:sim/:cmd',dis.receiveMessageRequest);
};


