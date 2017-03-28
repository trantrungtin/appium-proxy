'use strict';
var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    bodyParser = require('body-parser'),
    AppiumProxy = require('./appium-proxy');

var appiumproxy = new AppiumProxy();
var app = connect()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .use(function(req, res){
        appiumproxy.forward(req,res);
    });

http.createServer(app).listen(9000, function() {
    console.log('proxy listen 9000');
});
