import {ArgumentParser} from 'argparse';

const args = [
    [['-a', '--address'], {
        defaultValue: '0.0.0.0',
        required: false,
        example: '0.0.0.0',
        help: 'IP Address to listen on',
        dest: 'address',
    }],

    [['-p', '--port'], {
        defaultValue: 9000,
        required: false,
        type: 'int',
        example: '4723',
        help: 'port to listen on',
        dest: 'port',
    }],
    [['--real-url'], {
        dest: 'realUrl',
        required: true,
        example: 'https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub',
        help: 'Original URL of Appium'
    }],
    [['--command-timeout'], {
        dest: 'commandTimeout',
        defaultValue: '600',
        required: false,
        example: '600',
        help: 'Used to keep the server alive (in seconds)'
    }],
    [['--delete-session'], {
        dest: 'needDeleteSession',
        defaultValue: false,
        action: 'storeTrue',
        required: false,
        help: 'Ignore a delete session request to keep server alive',
        nargs: 0
    }],
    [['--capability-identify'], {
        dest: 'capabilityIdentify',
        defaultValue: "id",
        required: false,
        help: 'Identify which session will be used'
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

export function getParser() {
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
