var express = require('express');
var app = express();
var config = require('./config/config');
var MTarget = require('./api/MTarget');
var Account = require('./api/Account');
require('./config/routes')(app);

app.get('/', function (req, res) {
    var account = new Account(config.aliyunInstanceId,
        config.aliyunAccessKeyId,
        config.aliyunAccessKeySecret);
    var mtarget = new MTarget(account);
    var endTime = new Date().getTime();
    var startTime = endTime - 24*3600*1000;
    var options = {Namespace: 'acs/ecs', MetricName: 'vm.DiskIOWrite',
        StartTime: startTime, EndTime: endTime, Period: '5m', Statistics: 'Average',
        NextToken: 1, Length: 500};
    mtarget.getMetricDatumP(options).then(function(response) {
        res.send(response.body);
    });
});

// 静态资源
app.use('/', express.static(__dirname + '/web'));

var server = app.listen(config.port, function() {
    console.log('Express server is listening on port %d in %s mode.\n', config.port, app.get('env'));
});

exports = module.exports = app;