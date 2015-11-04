/**
 * Created by liz on 2015/10/29.
 */
var OpenStack = require("./OpenStack");
var extend = require("extend");
var moment = require('moment');
var MTarget = (function () {
    function MTarget(account) {
        this._openstack = new OpenStack(account);
    }

    // 获取云监控数据
    // options: 选项参数。公共参数及Action、Timestamp、instanceId、Dimensions参数已设好，可覆盖
    MTarget.prototype.getMetricDatumP = function(options) {
        var specParams = {
            Action: 'DescribeMetricDatum',
            Timestamp: moment.utc().format("YYYY-MM-DDTHH:mm:ss") + "Z", // 刷新时间戳
        };
        return this._openstack.sendP(extend(specParams, options));
    }

    return MTarget;
})();

module.exports = MTarget;