import winston from 'winston';

winston.emitErrs = true;
const tsFormat = () => (new Date()).toLocaleTimeString();

let logger = new winston.Logger({    
    transports: [
        new (winston.transports.Console)({
            level: 'debug',
            colorize: true,
            timestamp: tsFormat
        })
    ],
    exitOnError: false
});

export default logger;
