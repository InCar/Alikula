/**
 * Created by liz on 2015/10/29.
 */
var crypto = require("crypto");
var Account = (function(){
    function Account(instanceId, accessKeyId, accessKeySecret) {
        this._instanceId = instanceId;
        this._accessKeyId = accessKeyId;
        this._accessKeySecret = accessKeySecret;
    }
    Account.prototype.getAccessKeyId = function () {
        return this._accessKeyId;
    };
    Account.prototype.getInstanceId = function() {
        return this._instanceId;
    }

    // encoding: "hex", "binary" or "base64"
    Account.prototype.hmac_sha1 = function (text, encoding) {
        var hmacSHA1 = crypto.createHmac("sha1", this._accessKeySecret + "&");
        return hmacSHA1.update(text).digest(encoding);
    };

    return Account;
})();

module.exports = Account;