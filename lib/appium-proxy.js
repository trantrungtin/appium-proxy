'use strict';
var httpProxy = require('http-proxy');
var url = require('url');
var utils = require('./utils');
var ProxyHandler = require('./proxy-handler');
var logger = require('./logger');
var http = require('http');

var createdSession = false;
var sessionRes = {};
var sessionId;
var proxyHandler = new ProxyHandler();
var commandTimeout;
var ignoreDeleteSession;

var AppiumProxy = module.exports = function AppiumProxy(args) {

    commandTimeout = args.commandTimeout;
    ignoreDeleteSession = args.ignoreDeleteSession;
    this.proxyUrl = args.realUrl;

    var agent = new http.Agent({ maxSockets: Number.MAX_VALUE });
    this.proxy = httpProxy.createProxyServer({
        target: this.proxyUrl,
        agent: agent, 
        changeOrigin: true, 
        preserveHeaderKeyCase: true,
        auth: url.parse(this.proxyUrl).auth
    });
    
    this.proxy.on('proxyReq', this.proxyReqFunc);
    this.proxy.on('proxyRes', this.proxyResFunc);
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
            this.proxy.web(req, res, function(e) {
                logger.error('[forward] error:', e);
            });
        }
    },
    proxyReqFunc: function(proxyReq, req, res, options) {
        if (req.body) {

            utils.printHttpRequest(req);
            
            // modify a new command timeout
            if (utils.isCreateSession(req)) {
                var caps = req.body;
                caps['desiredCapabilities'].newCommandTimeout = commandTimeout;
                logger.debug('[proxyReqFunc] caps:', caps);
            }

            let bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
        }
    },
    proxyResFunc: function(proxyRes, req, res, options) {
        utils.modifyResponse(res, function(body) {

            utils.printHttpRespond(res, body);

            if (utils.isCreateSession(req) && utils.isSuccess(res)) {
                createdSession = true;
                sessionRes = body;
                sessionId = sessionRes.sessionId;
                proxyHandler.setBodySession(body);
                proxyHandler.setSessionId(body.sessionId);
            }
        });
    }
}
