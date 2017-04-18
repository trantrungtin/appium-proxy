import http from 'http';
import url from 'url';
import _ from 'lodash';
import { createProxyServer } from 'http-proxy';
import logger from './logger'
import { isCreateSession, isDeleteSession, isDeleteWindow, getCapabilities, getSessionId, 
    printHttpRequest, printHttpRespond, isSuccess, modifyResponse} from './utils';

class AppiumProxy {
    constructor (opts = {}) {
        this.opts = _.cloneDeep(opts);
        this.sessionMap = {};

        // create a proxy instance
        var agent = new http.Agent({ maxSockets: Number.MAX_VALUE });
        this.proxy = createProxyServer({
            target: this.opts.realUrl,
            agent: agent, 
            changeOrigin: true, 
            preserveHeaderKeyCase: true,
            auth: url.parse(this.opts.realUrl).auth
        });
        
        this.proxy.on('proxyReq', this.proxyReqFunc, this);
        this.proxy.on('proxyRes', this.proxyResFunc, this);
    }

    handleCreatedSession (req, res) {
        if (isCreateSession(req)) {
            let caps = getCapabilities(req.body);
            if (!caps.hasOwnProperty(this.opts.capabilityIdentify)) {
                let errorMsg = `You must add ${this.opts.capabilityIdentify} capability into your caps.`;
                let errorObj = { "error":true, "message":errorMsg };
                logger.error(errorMsg);
                res.writeHead(404, {'Content-type': 'application/json'});            
                res.end(JSON.stringify(errorObj));
                return true;
            }

            let identifyKey = caps[this.opts.capabilityIdentify];
            if (this.sessionMap.hasOwnProperty(identifyKey)) {
                let session = this.sessionMap[identifyKey].sessionRes;
                logger.debug('[handleCreatedSession] sessionRes:', session);
                res.writeHead(200, {'Content-type': 'application/json'});
                res.end(JSON.stringify(session));
                return true;
            }
        }
        return false;
    }

    handleDeleteSession (req, res) {
        if (!this.opts.needDeleteSession && isDeleteSession(req)) {
            let sessionId = getSessionId(req);
            let bodyDeleteSession = {"status":0,"value":null,"sessionId":sessionId};
            logger.debug('[handleDeleteSession] sessionId:', sessionId);
            res.writeHead(200, {'Content-type': 'application/json'});
            res.end(JSON.stringify(bodyDeleteSession));
            return true;
        }
        return false;
    }

    handleDeleteWindow (req, res) {
        if (!this.opts.needDeleteSession && isDeleteWindow(req)) {
            let sessionId = getSessionId(req);
            let bodyDeleteSession = {"status":0,"value":null,"sessionId":sessionId};
            logger.debug('[handleDeleteWindow] sessionId:', sessionId);
            res.writeHead(200, {'Content-type': 'application/json'});
            res.end(JSON.stringify(bodyDeleteSession));
            return true;
        }
        return false;
    }

    forward (req, res) {

        if (this.handleCreatedSession(req, res) 
            || this.handleDeleteSession(req, res)
            || this.handleDeleteWindow(req, res))
        {
            // do nothing
        }
        else {
            this.proxy.web(req, res, function(e) {
                logger.error('[forward] error:', e);
            });
        }
    }

    json (req, res) {
        let jsonSession = _.cloneDeep(this.sessionMap);
        res.writeHead(200, {'Content-type': 'application/json'});
        logger.debug('json:', jsonSession);
        res.end(JSON.stringify(jsonSession, null, 4));
    }

    proxyReqFunc (proxyReq, req, res, options) {
        if (req.body) {
            // print a http request
            printHttpRequest(req);
            // modify a body
            let body = _.cloneDeep(req.body);
            if (isCreateSession(req)) {
                var caps = getCapabilities(body);
                caps.newCommandTimeout = this.opts.commandTimeout;
                delete caps[this.opts.capabilityIdentify];
            }

            let bodyData = JSON.stringify(body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
        }
    }

    proxyResFunc (proxyRes, req, res, options) {
        let self = this;
        modifyResponse(res, function(body) {
            // print a http respond
            printHttpRespond(res, body);
            // retrieve a result
            if (!self.opts.needDeleteSession && isCreateSession(req) && isSuccess(res)) {
                let caps = getCapabilities(req.body);
                let identifyKey = caps[self.opts.capabilityIdentify];
                var obj = { 'sessionRes': _.cloneDeep(body) }
                self.sessionMap[identifyKey] = obj;
            }
        });
    }
}

export default AppiumProxy;
