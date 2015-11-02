/**
 * 签名
 * Created by liz on 2015/10/29.
 */
var Request = require("request");
var Promise = require("promise");
Request.requestP = Promise.denodeify(Request);
var extend = require("extend");
var uuid = require("node-uuid");
var querystring = require('querystring');
var moment = require('moment');
var config = require('../config/config');

var OpenStack = (function () {
    function OpenStack(account) {
        this._account = account;
        this._commonParams = {
            Format: 'JSON',
            Version: config.aliyunCMSVersion,
            AccessKeyId: account.getAccessKeyId(),
            Timestamp: moment.utc().format("YYYY-MM-DDTHH:mm:ss") + "Z",
            SignatureMethod: 'HMAC-SHA1',
            SignatureVersion: '1.0',
            SignatureNonce: uuid.v4(),
            RegionId: 'cn'
        };
    }

    OpenStack.prototype.getAccount = function() {
        return this._account;
    };
    // Send the request
    // params: 除公共参数外的其它参数，一个hash参数
    OpenStack.prototype.sendP = function (params) {
        var params = extend(this._commonParams, params);
        params.Signature = this.signature(params);

        var url = config.aliyunCMSUrl + "?" +  querystring.stringify(params);
        return Request.requestP({method: 'GET', url: url});
    };

    // aliyun CMS signature
    // params: 请求参数
    OpenStack.prototype.signature = function (params) {
        var keys = Object.keys(params).sort();
        var orderedParams = [];
        keys.forEach(function(key) {
            orderedParams.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        })
        var StringToSign = 'GET&%2F&' + encodeURIComponent(orderedParams.join('&'));
        return this._account.hmac_sha1(StringToSign, "base64");
    };
    return OpenStack;
})();


module.exports = OpenStack;