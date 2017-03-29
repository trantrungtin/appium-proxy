'use strict';
var httpProxy = require('http-proxy');
var url = require('url');
var utils = require('./utils');
var ProxyHandler = require('./proxy-handler');

var createdSession = false;
var sessionRes = {};
var sessionId;
var proxyHandler = new ProxyHandler();

var AppiumProxy = module.exports = function AppiumProxy(args) {
    this.proxy = httpProxy.createProxyServer({});
    this.proxy.on('proxyReq', proxyReqFunc);
    this.proxy.on('proxyRes', proxyResFunc);
    this.proxyUrl = args.realUrl;
    this.commandTimeout = args.commandTimeout;
    this.ignoreDeleteSession = args.ignoreDeleteSession;
}

AppiumProxy.prototype = {
    forward: function(req, res) {

        // before forward message
        if (createdSession && utils.isCreateSession(req)) {
            proxyHandler.handleCreatedSession(req,res);
        }
        else if (utils.isDeleteSession(req)) {
            proxyHandler.handleDeleteSession(req, res);
        }
        else {
            this.proxy.web(req, res, {target: this.proxyUrl}, function(e) {
                console.log(e);
            });
        }
    }
}

function proxyReqFunc(proxyReq, req, res, options) {
    if (req.body) {
        let bodyData = JSON.stringify(req.body);

        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type','application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
}

function proxyResFunc(proxyRes, req, res, options) {
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
