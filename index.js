'use strict';
var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    bodyParser = require('body-parser'),
    AppiumProxy = require('./appium-proxy'),
    parser = require('./parser');


var mainParser = parser.getParser();
let args = mainParser.parseArgs();
console.log('args:', args);
var appiumproxy = new AppiumProxy(args);
var app = connect()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .use(function(req, res){
        appiumproxy.forward(req,res);
    });

http.createServer(app).listen(9000, function() {
    console.log('proxy listen 9000');
});
