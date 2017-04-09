import logger from './logger';
import {isCreateSession, isDeleteSession, isSuccess} from './utils';
import SingleExecutionHandler from './single-execution-handler';
import MultiExecutionHandler from './multi-execution-handler';

class ProxyHandler {
    constructor (args = {}) {
        if (args.identifySessionKey) {
            this.execution = new MultiExecutionHandler(args);
        }
        else {
            this.execution = new SingleExecutionHandler(args);
        }

        this.ignoreDeleteSession = args.ignoreDeleteSession;
    }

    // handleCreatedSession
    handleCreatedSession (req, res) {
        // check the session was created or not
        if (isCreateSession(req)) {
            return this.execution.handleCreatedSession(req, res);                           
        }
        return false;
    }

    handleDeleteSession (req, res) {
        if (this.ignoreDeleteSession == 'true' 
            && isDeleteSession(req)) {
            this.execution.handleDeleteSession(req, res);
            return true;
        }
        return false;
    }

    // handle a http request, modify its body
    // should return its body because we need a original request to use later
    handleRequest (req) {
        return this.execution.handleRequest(req);
    }

    // handle a respond before return to client
    handleRespond (req, res, body) {
        if (this.ignoreDeleteSession == 'true' 
            && isCreateSession(req) 
            && isSuccess(res)) {
            this.execution.handleRespond(req, res, body);
        }
    }

    json () {
        return this.execution.json();
    }
}

export default ProxyHandler;