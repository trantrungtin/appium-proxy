import BufferHelper from 'bufferhelper';
import Route from 'route-parser';
import colors from 'colors/safe';
import logger from './logger';

export function getSessionId(req) {
    var route = new Route('/session/:sessionid(/window)');
    var obj = route.match(req.url);
    if (obj) {
        return obj.sessionid;
    }
    return "";
}

export function isCreateSession(req) {
    if (req.method == 'POST' && req.url == '/session') {
        return true;
    }
    return false;
}

export function isDeleteWindow(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/session/:sessionid/window');
        return route.match(req.url) != false;
    }
    return false;
}

export function isDeleteSession(req) {
    if (req.method == 'DELETE') {
        var route = new Route('/session/:sessionid');
        return route.match(req.url) != false;
    }
    return false;
}

export function isSuccess(res) {
    if (res.statusCode == 200) {
        return true;
    }
    return false;
}

export function printHttpRequest(req) {
    let result = colors.inverse('[request]') + '\t' 
        + colors.yellow(req.method) + '\t' 
        + colors.green.underline(req.url) + '\t' 
        + colors.gray(JSON.stringify(req.body));
    logger.debug(result);
}

export function printHttpRespond(res, body) {
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

export function getCapabilities(body) {
    var desiredCapabilities = body['desiredCapabilities'];
    return desiredCapabilities;
}

export function getIdentifySessionValue(body, identifySessionKey) {
    var desiredCapabilities = getCapabilities(body);
    var identifyValue = desiredCapabilities[identifySessionKey];
    return identifyValue;
}

export function modifyResponse(res, callback) {
    var _write = res.write;
    var _end = res.end;
    var buffer = new BufferHelper();
    res.write = function(data) {
        buffer.concat(data);
    }
    res.end = function() {
        var body = buffer.toBuffer().toString();
        try {
            body = JSON.parse(body);
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