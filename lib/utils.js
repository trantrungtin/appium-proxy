'use strict';
var BufferHelper = require('bufferhelper');
var Route = require('route-parser');
var logger = require('./logger');
var colors = require('colors/safe');

function isCreateSession(req) {
    if (req.method == 'POST' && req.url == '/session') {
        return true;
    }
    return false;
}

function isDeleteWindow(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/session/:sessionid/window');
        return route.match(req.url);
    }
    return false;
}

function isDeleteSession(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/session/:sessionid');
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

function printHttpRequest(req) {
    let result = colors.inverse('[request]') + '\t' 
        + colors.yellow(req.method) + '\t' 
        + colors.green.underline(req.url) + '\t' 
        + colors.gray(JSON.stringify(req.body));
    logger.debug(result);
}

function printHttpRespond(res, body) {
    let status = "";
    if (res.statusCode == 200) {
        status = colors.green(res.statusCode);
    }
    else {
        status = colors.red(res.statusCode);
    }

    let result = colors.inverse('[respond]') + '\t' 
        + status + '\t' 
        + colors.gray(JSON.stringify(body));
    logger.debug(result);
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
exports['printHttpRequest'] = printHttpRequest;
exports['printHttpRespond'] = printHttpRespond;
