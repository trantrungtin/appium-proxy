'use strict';
var BufferHelper = require('bufferhelper');
var Route = require('route-parser');
var logger = require('./logger');

function isCreateSession(req) {
    if (req.method == 'POST' && req.url == '/wd/hub/session') {
        return true;
    }
    return false;
}

function isDeleteWindow(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/wd/hub/session/:sessionid/window');
        return route.match(req.url);
    }
    return false;
}

function isDeleteSession(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/wd/hub/session/:sessionid');
        return route.match(req.url);
    }
    return false;
}

function isSuccess(res) {
    if (res.statusCode == 200) {
        return true;
    }
    return false;
}

var modifyResponse = function (res, callback) {
    var _write = res.write;
    var _end = res.end;
    var buffer = new BufferHelper();
    res.write = function(data) {
        buffer.concat(data);
    }
    res.end = function() {
        var body;
        try {
            body = JSON.parse(buffer.toBuffer().toString());
            if (typeof callback === 'function') {
                callback(body);
            }

            body = new Buffer(JSON.stringify(body));
        }
        catch (e) {
            logger.error('[modifyResponse] JSON.parse error:', e);
        }
        _write.call(res, body);
        _end.call(res);
    }
}

var exports = module.exports = {};
exports['isCreateSession'] = isCreateSession;
exports['modifyResponse'] = modifyResponse;
exports['isDeleteWindow'] = isDeleteWindow;
exports['isDeleteSession'] = isDeleteSession;
exports['isSuccess'] = isSuccess;
