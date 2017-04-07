'use strict';
var logger = require('./logger');
var utils = require('./utils');

var MultiExecutionHandler = module.exports = function MultiExecutionHandler(args) {
    this.sessionMap = {};
    this.commandTimeout = args.commandTimeout;
    this.ignoreDeleteSession = args.ignoreDeleteSession;

    // set up multi-execution
    this.identifySessionKey = args.identifySessionKey;
    this.supportedMultiExecution = false;
    if (args.identifySessionKey) {
        this.supportedMultiExecution = true;
    }
}

MultiExecutionHandler.prototype = {
    _letUserAddSessionIdentify: function(req, res) {
        let errorMsg = "You must add " + this.identifySessionKey + " property into your caps.";
        let errorObj = {
            "error":true, 
            "message":errorMsg
        };
        logger.error(errorMsg);
        res.writeHead(404, {'Content-type': 'application/json'});            
        res.end(JSON.stringify(errorObj));
    },
    _returnSessionFromCache: function(req, res, identifyKey) {
        let sessionRes = this.sessionMap[identifyKey].sessionRes;
        logger.debug('[handleCreatedSession] sessionRes:', sessionRes);
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(JSON.stringify(sessionRes));
    },
    _storeSessionId: function (req, res, body) {
        var sessionRes = body;
        var identify = utils.getIdentifySessionValue(req.body, this.identifySessionKey);

        var obj = {
            'sessionRes': sessionRes
        }
        this.sessionMap[identify] = obj;
    },
    _removeIdentifySessionKey: function(desiredCapabilities) {
        if (desiredCapabilities.hasOwnProperty(this.identifySessionKey)) {
            delete desiredCapabilities[this.identifySessionKey];
        }
    },
    _updateCommandTimeout: function(desiredCapabilities) {
        desiredCapabilities.newCommandTimeout = this.commandTimeout;
    },
    _findIdentifyKey: function(sessionId) {
        for (var key in this.sessionMap) {
            if (this.sessionMap.hasOwnProperty(key)) {
                if (this.sessionMap[key].sessionRes.sessionId == sessionId) {
                    return key;
                }
            }
        }
        return null;
    },
    handleCreatedSession: function(req, res) {
        var needForward = true;
        // check identifySessionKey first
        var desiredCapabilities = utils.getCapabilities(req.body);
        if (desiredCapabilities.hasOwnProperty(this.identifySessionKey)) {
            let identifyKey = desiredCapabilities[this.identifySessionKey];
            if (this.sessionMap.hasOwnProperty(identifyKey)) {
                this._returnSessionFromCache(req, res, identifyKey);
                needForward = false;
            }            
        }
        else {
            // error
            this._letUserAddSessionIdentify(req, res);
            needForward = false;
        }
        return !needForward;
    },
    handleDeleteSession: function(req, res) {
        let sessionId = utils.getSessionId(req);
        let bodyDeleteSession = {"status":0,"value":null,"sessionId":sessionId};
        logger.debug('[handleDeleteSession] sessionId:', sessionId);
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(JSON.stringify(bodyDeleteSession));
        // let key = this._findIdentifyKey(sessionId);
        // if (this.sessionMap.hasOwnProperty(key)) {
        //     delete this.sessionMap[key];
        // }
    },
    handleRequest: function(req) {
        // deep copy a body
        var body = JSON.parse(JSON.stringify(req.body));
        // modify a new command timeout
        if (utils.isCreateSession(req)) {
            var desiredCapabilities = utils.getCapabilities(body);
            this._updateCommandTimeout(desiredCapabilities);
            this._removeIdentifySessionKey(desiredCapabilities);
        }
        return body;
    },
    handleRespond: function(req, res, body) {
        this._storeSessionId(req, res, body);
    },
    json: function() {
        return JSON.parse(JSON.stringify(this.sessionMap));
    }
}