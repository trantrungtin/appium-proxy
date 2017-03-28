'use strict';
var httpProxy = require('http-proxy');
var url = require('url');

var PROXY_URL = 'http://192.168.167.214:4724';

var AppiumProxy = module.exports = function AppiumProxy() {
    this.proxy = httpProxy.createProxyServer({});
    this.proxy.on('proxyReq', proxyReqFunc);
    this.proxy.on('proxyRes', proxyResFunc);
}

AppiumProxy.prototype = {
    forward: function(req, res) {
        this.proxy.web(req, res, {target: PROXY_URL}, function(e) {
            console.log(e);
        });
    }
}

function proxyReqFunc(proxyReq, req, res, options) {
    if (req.body) {
        // console.log('method:', req.method);
        // console.log('url:', req.url);

        let bodyData = JSON.stringify(req.body);
        //console.log('data:', bodyData);

        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type','application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
}

function proxyResFunc(proxyRes, req, res, options) {

}
