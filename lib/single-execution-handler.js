'use strict';
var logger = require('./logger');
var utils = require('./utils');

var SingleExecutionHandler = module.exports = function SingleExecutionHandler(args) {
    this.sessionRes = {};
    this.sessionId = "";
    var createdSession = false;

    this.commandTimeout = args.commandTimeout;
}

SingleExecutionHandler.prototype = {
    _setBodySession: function(sessionRes) {
        this.sessionRes = sessionRes;
    },
    _setSessionId: function(sessionId) {
        this.sessionId = sessionId;
    },
    _updateCommandTimeout: function(caps) {
        caps['desiredCapabilities'].newCommandTimeout = this.commandTimeout;
    },
    handleCreatedSession: function(req, res) {
        // check the session was created or not
        if (this.createdSession) {
            res.writeHead(200, {'Content-type': 'application/json'});
            logger.debug('[handleCreatedSession] sessionRes:', this.sessionRes);
            res.end(JSON.stringify(this.sessionRes));
            return true;
        }
        return false;
    },
    handleDeleteSession: function(req, res) {
        res.writeHead(200, {'Content-type': 'application/json'});
        let bodyDeleteSession = {"status":0,"value":null,"sessionId":""};
        bodyDeleteSession.sessionId = this.sessionId;
        logger.debug('[handleDeleteSession] sessionId:', this.sessionId);
        res.end(JSON.stringify(bodyDeleteSession));
    },
    handleRequest: function(req) {
        // deep copy a body
        var body = JSON.parse(JSON.stringify(req.body));
        // modify a new command timeout
        if (utils.isCreateSession(req)) {
            var caps = body;
            this._updateCommandTimeout(caps);
        }
        return body;
    },
    handleRespond: function(req, res, body) {
        this.createdSession = true;
        this._setBodySession(body);
        this._setSessionId(body.sessionId);
    },
    json: function() {
        let jsonSession = {};
        jsonSession[this.sessionId] = this.sessionRes;
        return JSON.parse(JSON.stringify(jsonSession));
    }
}