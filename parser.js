'use strict';

var ArgumentParser = require('argparse').ArgumentParser;

const args = [
    [['--real-url'], {
        dest: 'realUrl',
        required: true,
        example: '192.168.167.214:4723',
        help: 'Original URL of Appium'
    }],
    [['--command-timeout'], {
        dest: 'commandTimeout',
        defaulValue: 600,
        required: false,
        example: '600',
        help: 'This used to keep the server alive (in seconds)'
    }],
    [['--ignore-delete-session'], {
        dest: 'ignoreDeleteSession',
        defaulValue: true,
        required: false,
        help: 'This proxy will ignore a delete session request to keep server alive'
    }]
];

function getParser() {
    let parser = new ArgumentParser({
        varsion: '0.0.1',
        addHelp: true,
        description: 'The proxy for appium server (cloud)'
    });
    for (let arg of args) {
        parser.addArgument(arg[0], arg[1]);
    }
    return parser;
}

var exports = module.exports = {};
exports['getParser'] = getParser;
