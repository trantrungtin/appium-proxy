#!/usr/bin/env node

import http from 'http';
import connect from 'connect';
import httpProxy from 'http-proxy';
import url from 'url';
import BodyParser from 'body-parser';
import { asyncify } from 'asyncbox';
import {getParser} from './parser';
import AppiumProxy from './appium-proxy';
import logger from './logger';

async function main() {
    var parser = getParser();
    let args = parser.parseArgs();
    logger.info('[main] Proxy starts with arguments and default values:', args);
    var proxy = new AppiumProxy(args);
    var app = connect()
        .use(BodyParser.json())
        .use('/json', function(req, res, next) {
            proxy.json(req, res);
            // next();
        })
        .use(function(req, res){
            proxy.forward(req,res);
        });

    http.createServer(app).listen(args.port, args.address, function() {
        var logMessage = 'Appium proxy listener started on ' + (args.address + ':' + args.port);
        logger.info(logMessage)
    });
}

if (require.main === module) { 
    asyncify(main);
}

exports.main = main;
