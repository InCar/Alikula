var express = require('express');
var app = express();
var config = require('./config/config');
var MTarget = require('./api/MTarget');
var Account = require('./api/Account');

app.get('/api/alicms', function (req, res) {
    var account = new Account(req.query.InstanceId,
            config.aliyunAccessKeyId,
            config.aliyunAccessKeySecret);
    var mtarget = new MTarget(account);
    var options = {Namespace: req.query.Namespace, MetricName: req.query.MetricName,
            instanceId: req.query.instanceId, Dimensions: '{instanceId:"' + req.query.instanceId + '", netname: "eth1"}',
            StartTime: new Date(req.query.StartTime).getTime() - 8*3600*1000, EndTime: new Date(req.query.EndTime).getTime() - 8*3600*1000,
            Period: req.query.Period, Statistics: req.query.Statistics,
            NextToken: 1, Length: 2000};
    mtarget.getMetricDatumP(options).then(function(response) {
        res.send(response.body);
    });
});

// 静态资源
app.use('/scripts', express.static(__dirname + '/web/scripts'));
app.use('/styles', express.static(__dirname + '/web/styles'));
app.use('/view', express.static(__dirname + '/web/view'));
app.all('/*', function(req, res, next) {
    if (req.path.indexOf('/api') >= 0) {
        next();
    } else {
        res.sendfile('web/index.html');
    }
});

var server = app.listen(config.port, function() {
    console.log('Express server is listening on port %d in %s mode.\n', config.port, app.get('env'));
});

exports = module.exports = app;