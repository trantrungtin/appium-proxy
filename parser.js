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
        defaultValue: '600',
        required: false,
        example: '600',
        help: 'This used to keep the server alive (in seconds)'
    }],
    [['--ignore-delete-session'], {
        dest: 'ignoreDeleteSession',
        defaultValue: 'true',
        required: false,
        help: 'This proxy will ignore a delete session request to keep server alive'
    }]
];

function updateParseArgsForDefaultValue(parser) {
  parser._parseArgs = parser.parseArgs;
  let defaultArgs = args;
  parser.parseArgs = function (args) {
    let parsedArgs = parser._parseArgs(args);
    for (let arg of defaultArgs) {
        let dest = arg[1].dest;
        if (!(dest in parsedArgs)) {
            parsedArgs[dest] = arg[1].defaultValue;
        }
    }
    return parsedArgs;
  };
}

function getParser() {
    let parser = new ArgumentParser({
        varsion: '0.0.1',
        addHelp: true,
        description: 'The proxy for appium server (cloud)'
    });
    for (let arg of args) {
        parser.addArgument(arg[0], arg[1]);
    }
    updateParseArgsForDefaultValue(parser);
    return parser;
}

var exports = module.exports = {};
exports['getParser'] = getParser;
