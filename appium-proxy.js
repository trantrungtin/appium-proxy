'use strict';
var httpProxy = require('http-proxy');
var url = require('url');
var utils = require('./utils');
var ProxyHandler = require('./proxy-handler');

var createdSession = false;
var sessionRes = {};
var sessionId;
var proxyHandler = new ProxyHandler();
var commandTimeout;
var ignoreDeleteSession;

var AppiumProxy = module.exports = function AppiumProxy(args) {
    this.proxy = httpProxy.createProxyServer({});
    this.proxy.on('proxyReq', this.proxyReqFunc);
    this.proxy.on('proxyRes', this.proxyResFunc);
    this.proxyUrl = args.realUrl;
    commandTimeout = args.commandTimeout;
    ignoreDeleteSession = args.ignoreDeleteSession;
}

AppiumProxy.prototype = {
    forward: function(req, res) {

        // before forward message
        if (createdSession && utils.isCreateSession(req)) {
            proxyHandler.handleCreatedSession(req,res);
        }
        else if (ignoreDeleteSession == 'true' && utils.isDeleteSession(req)) {
            proxyHandler.handleDeleteSession(req, res);
        }
        else {
            this.proxy.web(req, res, {target: this.proxyUrl}, function(e) {
                console.log(e);
            });
        }
    },
    proxyReqFunc: function(proxyReq, req, res, options) {
        if (req.body) {
            
            // modify a new command timeout
            if (utils.isCreateSession(req)) {
                var caps = req.body;
                caps['desiredCapabilities'].newCommandTimeout = commandTimeout;
                console.log('caps: ', caps);
            }

            let bodyData = JSON.stringify(req.body);
            // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
            proxyReq.setHeader('Content-Type','application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
        }
    },
    proxyResFunc: function(proxyRes, req, res, options) {
        utils.modifyResponse(res, function(body) {
            if (utils.isCreateSession(req)) {
                createdSession = true;
                sessionRes = body;
                sessionId = sessionRes.sessionId;
                proxyHandler.setBodySession(body);
                proxyHandler.setSessionId(body.sessionId);
            }
        });
    }
}
