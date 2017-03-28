'use strict';

var ProxyHandler = module.exports = function ProxyHandler() {
    this.sessionRes = {};
    this.sessionId = "";
}

ProxyHandler.prototype = {
    setBodySession: function(sessionRes) {
        this.sessionRes = sessionRes;
    },
    setSessionId: function(sessionId) {
        this.sessionId = sessionId;
    },
    handleCreatedSession: function(req, res) {
        res.writeHead(200, {'Content-type': 'application/json'});
        console.log('handleCreatedSession:', this.sessionRes);
        res.end(JSON.stringify(this.sessionRes));
    },
    handleDeleteSession: function(req, res) {
        res.writeHead(200, {'Content-type': 'application/json'});
        let bodyDeleteSession = {"status":0,"value":null,"sessionId":""};
        bodyDeleteSession.sessionId = this.sessionId;
        console.log('handleDeleteSession:', this.sessionId);
        res.end(JSON.stringify(bodyDeleteSession));
    }
}
