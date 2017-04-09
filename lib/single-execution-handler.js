import logger from './logger';
import {isCreateSession} from './utils';

class SingleExecutionHandler {
    constructor (args = {}) {
        this.sessionRes = {};
        this.sessionId = "";
        var createdSession = false;

        this.commandTimeout = args.commandTimeout;
    }

    _setBodySession (sessionRes) {
        this.sessionRes = sessionRes;
    }

    _setSessionId (sessionId) {
        this.sessionId = sessionId;
    }

    _updateCommandTimeout (caps) {
        caps['desiredCapabilities'].newCommandTimeout = this.commandTimeout;
    }

    handleCreatedSession (req, res) {
        // check the session was created or not
        if (this.createdSession) {
            res.writeHead(200, {'Content-type': 'application/json'});
            logger.debug('[handleCreatedSession] sessionRes:', this.sessionRes);
            res.end(JSON.stringify(this.sessionRes));
            return true;
        }
        return false;
    }

    handleDeleteSession (req, res) {
        res.writeHead(200, {'Content-type': 'application/json'});
        let bodyDeleteSession = {"status":0,"value":null,"sessionId":""};
        bodyDeleteSession.sessionId = this.sessionId;
        logger.debug('[handleDeleteSession] sessionId:', this.sessionId);
        res.end(JSON.stringify(bodyDeleteSession));
    }

    handleRequest (req) {
        // deep copy a body
        var body = JSON.parse(JSON.stringify(req.body));
        // modify a new command timeout
        if (isCreateSession(req)) {
            var caps = body;
            this._updateCommandTimeout(caps);
        }
        return body;
    }

    handleRespond (req, res, body) {
        this.createdSession = true;
        this._setBodySession(body);
        this._setSessionId(body.sessionId);
    }

    json () {
        let jsonSession = {};
        jsonSession[this.sessionId] = this.sessionRes;
        return JSON.parse(JSON.stringify(jsonSession));
    }
}

export default SingleExecutionHandler;