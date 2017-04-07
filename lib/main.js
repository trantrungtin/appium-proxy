#!/usr/bin/env node

var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    bodyParser = require('body-parser'),
    AppiumProxy = require('./appium-proxy'),
    parser = require('./parser'),
    logger = require('./logger');

function main() {
    var mainParser = parser.getParser();
    let args = mainParser.parseArgs();
    logger.info('[main] Proxy starts with arguments and default values:', args);
    var appiumproxy = new AppiumProxy(args);
    var app = connect()
        .use(bodyParser.json())
        .use('/json', function(req, res, next) {
            appiumproxy.json(req, res);
            // next();
        })
        .use(function(req, res){
            appiumproxy.forward(req,res);
        });

    http.createServer(app).listen(args.port, args.address, function() {
        var logMessage = 'Appium proxy listener started on ' + (args.address + ':' + args.port);
        logger.info(logMessage)
    });
}

if (require.main === module) { 
    main(); 
}

exports.main = main;
