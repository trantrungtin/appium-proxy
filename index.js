#!/usr/bin/env node

var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    bodyParser = require('body-parser'),
    AppiumProxy = require('./appium-proxy'),
    parser = require('./parser'),
    logger = require('./logger');


var mainParser = parser.getParser();
let args = mainParser.parseArgs();
logger.info('[main] Proxy starts with arguments and default values:', args);
var appiumproxy = new AppiumProxy(args);
var app = connect()
    .use(bodyParser.json())
    // .use(bodyParser.urlencoded())
    .use(function(req, res){
        appiumproxy.forward(req,res);
    });

http.createServer(app).listen(9000, function() {
    logger.info('[main] Proxy running at http://localhost:9000');
});
