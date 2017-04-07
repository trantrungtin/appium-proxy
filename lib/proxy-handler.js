'use strict';
var logger = require('./logger');
var utils = require('./utils');
var SingleExecutionHandler = require('./single-execution-handler');
var MultiExecutionHandler = require('./multi-execution-handler');

var ProxyHandler = module.exports = function ProxyHandler(args) {
    if (args.identifySessionKey) {
        this.execution = new MultiExecutionHandler(args);
    }
    else {
        this.execution = new SingleExecutionHandler(args);
    }

    this.ignoreDeleteSession = args.ignoreDeleteSession;
}

ProxyHandler.prototype = {
    // handleCreatedSession
    handleCreatedSession: function(req, res) {
        // check the session was created or not
        if (utils.isCreateSession(req)) {
            return this.execution.handleCreatedSession(req, res);                           
        }
        return false;
    },
    handleDeleteSession: function(req, res) {
        if (this.ignoreDeleteSession == 'true' 
            && utils.isDeleteSession(req)) {
            this.execution.handleDeleteSession(req, res);
            return true;
        }
        return false;
    },
    // handle a http request, modify its body
    // should return its body because we need a original request to use later
    handleRequest: function(req) {
        return this.execution.handleRequest(req);
    },
    // handle a respond before return to client
    handleRespond: function(req, res, body) {
        if (this.ignoreDeleteSession == 'true' 
            && utils.isCreateSession(req) 
            && utils.isSuccess(res)) {
            this.execution.handleRespond(req, res, body);
        }
    }
}
