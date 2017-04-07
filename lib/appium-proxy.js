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
var proxyHandler;
var ignoreDeleteSession;

var AppiumProxy = module.exports = function AppiumProxy(args) {
    ignoreDeleteSession = args.ignoreDeleteSession;
    proxyHandler = new ProxyHandler({
        "identifySessionKey": args.identifySessionKey,
        "commandTimeout": args.commandTimeout,
        "ignoreDeleteSession": args.ignoreDeleteSession
    });

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
        if (proxyHandler.handleCreatedSession(req,res) 
        || proxyHandler.handleDeleteSession(req, res)) 
        {
            // no need to forward the message
        }
        else {
            this.proxy.web(req, res, function(e) {
                logger.error('[forward] error:', e);
            });
        }
    },
    json: function(req, res) {
        let jsonSession = proxyHandler.json();
        res.writeHead(200, {'Content-type': 'application/json'});
        logger.debug('json:', jsonSession);
        res.end(JSON.stringify(jsonSession));
    },
    proxyReqFunc: function(proxyReq, req, res, options) {
        if (req.body) {
            // print a http request
            utils.printHttpRequest(req);
            // modify a body
            let body = proxyHandler.handleRequest(req);
            let bodyData = JSON.stringify(body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
        }
    },
    proxyResFunc: function(proxyRes, req, res, options) {
        utils.modifyResponse(res, function(body) {
            // print a http respond
            utils.printHttpRespond(res, body);
            // retrieve a result
            proxyHandler.handleRespond(req, res, body);
        });
    }
}
