/**
 * 签名
 * Created by liz on 2015/10/29.
 */
var Request = require("request");
var Xml2js = require("xml2js");
var Util = require("util");
var Promise = require("promise");
var Url = require("url");
Request.requestP = Promise.denodeify(Request);
var OpenStack = (function () {
    function OpenStack(account) {
        this._patternMQS = "MQS %s:%s";
        this._patternSign = "%s\n%s\n%s\n%s\n%s%s";
        this._contentType = "text/xml;charset=utf-8";
        this._version = "2014-07-08";
        this._account = account;
        // xml builder
        this._xmlBuilder = new Xml2js.Builder();
    }
    // Send the request
    // method: GET, POST, PUT, DELETE
    // url: request url
    // body: optional, request body
    // head: optional, request heads
    OpenStack.prototype.sendP = function (method, url, body, headers) {
        var req = { method: method, url: url };
        if (body)
            req.body = this._xmlBuilder.buildObject(body);
        req.headers = this.makeHeaders(method, url, headers, req.body);
        return Request.requestP(req).then(function (response) {
            // convert the body from xml to json
            return Xml2js.parseStringP(response.body, { explicitArray: false }).then(function (bodyJSON) {
                response.bodyJSON = bodyJSON;
                return response;
            }, function () {
                // cannot parse as xml
                response.bodyJSON = response.body;
                return response;
            });
        }).then(function (response) {
            if (response.statusCode < 400) {
                if (response.bodyJSON)
                    return response.bodyJSON;
                else
                    return response.statusCode;
            }
            else {
                if (response.bodyJSON)
                    return Promise.reject(response.bodyJSON);
                else
                    return Promise.reject(response.statusCode);
            }
        });
    };
    OpenStack.prototype.makeHeaders = function (mothod, url, headers, body) {
        // if not exist, create one
        if (!headers)
            headers = {};
        var contentMD5 = "";
        var contentType = "";
        if (body) {
            if (!headers["Content-Length"])
                headers["Content-Length"] = body.length;
            if (!headers["Content-Type"])
                headers["Content-Type"] = this._contentType;
            contentType = headers["Content-Type"];
            contentMD5 = this._account.b64md5(body);
            headers["Content-MD5"] = contentMD5;
        }
        if (!headers["x-mqs-version"])
            headers["x-mqs-version"] = this._version;
        // lowercase & sort & extract the x-mqs-<any>
        var headsLower = {};
        var keys = [];
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                var lower = key.toLowerCase();
                keys.push(lower);
                headsLower[lower] = headers[key];
            }
        }
        keys.sort();
        var mqsHeaders = "";
        for (var i in keys) {
            var k = keys[i];
            if (k.indexOf("x-mqs-") === 0) {
                mqsHeaders += Util.format("%s:%s\n", k, headsLower[k]);
            }
        }
        var tm = (new Date()).toUTCString();
        var mqsURL = Url.parse(url);
        headers.Date = tm;
        headers.Authorization = this.authorize(mothod, mqsURL.path, mqsHeaders, contentType, contentMD5, tm);
        headers.Host = mqsURL.host;
        return headers;
    };
    // ali mqs authorize header
    OpenStack.prototype.authorize = function (httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm) {
        return Util.format(this._patternMQS, this._account.getKeyId(), this.signature(httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm));
    };
    // ali mqs signature
    OpenStack.prototype.signature = function (httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm) {
        var text = Util.format(this._patternSign, httpVerb, contentMD5, contentType, tm, mqsHeaders, mqsURI);
        return this._account.hmac_sha1(text, "base64");
    };
    return OpenStack;
})();


module.exports = OpenStack;