import http from 'http';
import url from 'url';
import {createProxyServer} from 'http-proxy';
import ProxyHandler from './proxy-handler';
import logger from './logger'
import {modifyResponse, printHttpRequest, printHttpRespond} from './utils';

var createdSession = false;
var sessionRes = {};
var sessionId;
var handler;

class AppiumProxy {
    constructor (args = {}) {
        handler = new ProxyHandler({
            "identifySessionKey": args.identifySessionKey,
            "commandTimeout": args.commandTimeout,
            "ignoreDeleteSession": args.ignoreDeleteSession
        });

        this.proxyUrl = args.realUrl;

        var agent = new http.Agent({ maxSockets: Number.MAX_VALUE });
        this.proxy = createProxyServer({
            target: this.proxyUrl,
            agent: agent, 
            changeOrigin: true, 
            preserveHeaderKeyCase: true,
            auth: url.parse(this.proxyUrl).auth
        });
        
        this.proxy.on('proxyReq', this.proxyReqFunc);
        this.proxy.on('proxyRes', this.proxyResFunc);
    }

    forward (req, res) {
        // before forward message
        if (handler.handleCreatedSession(req,res) 
        || handler.handleDeleteSession(req, res)) 
        {
            // no need to forward the message
        }
        else {
            this.proxy.web(req, res, function(e) {
                logger.error('[forward] error:', e);
            });
        }
    }

    json (req, res) {
        let jsonSession = handler.json();
        res.writeHead(200, {'Content-type': 'application/json'});
        logger.debug('json:', jsonSession);
        res.end(JSON.stringify(jsonSession));
    }

    proxyReqFunc (proxyReq, req, res, options) {
        if (req.body) {
            // print a http request
            printHttpRequest(req);
            // modify a body
            let body = handler.handleRequest(req);
            let bodyData = JSON.stringify(body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
        }
    }

    proxyResFunc (proxyRes, req, res, options) {
        modifyResponse(res, function(body) {
            // print a http respond
            printHttpRespond(res, body);
            // retrieve a result
            handler.handleRespond(req, res, body);
        });
    }
}

export default AppiumProxy;
