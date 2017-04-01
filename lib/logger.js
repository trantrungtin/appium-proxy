'use strict';
var winston = require('winston');
winston.emitErrs = true;

const tsFormat = () => (new Date()).toLocaleTimeString();

var logger = new winston.Logger({    
    transports: [
        new (winston.transports.Console)({
            level: 'debug',
            colorize: true,
            timestamp: tsFormat
        })
    ],
    exitOnError: false
});

module.exports = logger;
