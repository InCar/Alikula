/**
 * Created by liz on 2015/10/29.
 */
var CryptoA = require("crypto");
var Buffer = require("buffer");
var Account = (function(){
    function Account(ownerId, keyId, keySecret) {
        this._ownerId = ownerId;
        this._keyId = keyId;
        this._keySecret = keySecret;
    }
    Account.prototype.getOwnerId = function () {
        return this._ownerId;
    };
    Account.prototype.getKeyId = function () {
        return this._keyId;
    };
    // encoding: "hex", "binary" or "base64"
    Account.prototype.hmac_sha1 = function (text, encoding) {
        var hmacSHA1 = CryptoA.createHmac("sha1", this._keySecret);
        return hmacSHA1.update(text).digest(encoding);
    };
    Account.prototype.b64md5 = function (text) {
        var cryptoMD5 = CryptoA.createHash("md5");
        var md5HEX = cryptoMD5.update(text).digest("hex");
        var buf = new Buffer.Buffer(md5HEX, "utf8");
        return buf.toString("base64");
    };

    return Account;
})();

module.exports = Account;