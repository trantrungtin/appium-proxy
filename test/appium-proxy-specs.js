import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import httpMocks from 'node-mocks-http';
import request from 'request';
import AppiumProxy from '../lib/appium-proxy';
import * as utils from '../lib/utils';
import logger from '../lib/logger'


let sandbox = sinon.sandbox.create();
let expect = chai.expect;
let assert = chai.assert;
chai.should();

describe('AppiumProxy', () => {
	var proxy;
	var req;
	var res;
	beforeEach(() => {
		proxy = new AppiumProxy({
			realUrl: 'http://localhost:4723/wd/hub', 
			commandTimeout: '100', 
			capabilityIdentify: 'idtest'
		});
		sandbox.stub(logger);
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();		
	});
	afterEach(() => {
		sandbox.restore();
	});
	describe('constructor', () => {
		it('should call AppiumProxy constructor with opts', () => {
			proxy.opts.realUrl.should.equal('http://localhost:4723/wd/hub');
			proxy.opts.commandTimeout.should.equal('100');
			proxy.opts.capabilityIdentify.should.equal('idtest');
		});
	});
	describe('handleCreatedSession', () => {
		var fakeSession = {
			'id1': {
				'ok' : true
			}
		}
		it('should return false if a request is not is create session request', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return false;});

			proxy.handleCreatedSession(req, res).should.be.false;
		});
		it('should return 404 if a caps doesn\'t have identify cap', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			sandbox.stub(utils, 'getCapabilities', () => {return {};});

			proxy.handleCreatedSession(req, res).should.be.true;
			res.statusCode.should.equal(404);
			var data = JSON.parse(res._getData());
			data.error.should.be.true;
			data.message.should.equal('You must add idtest capability into your caps.');
			assert.isTrue(res._isEndCalled());
		});
		it('should return false if there isn\'t any session', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			sandbox.stub(utils, 'getCapabilities', () => {return {'idtest': 'id1'};});

			proxy.handleCreatedSession(req, res).should.be.false;
		});
		it('should work fine when everything is ok', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			sandbox.stub(utils, 'getCapabilities', () => {return {'idtest': 'id1'};});
			proxy.sessionMap = fakeSession;

			proxy.handleCreatedSession(req, res).should.be.true;

			var data = JSON.parse(res._getData());
			data.ok.should.be.true;
			res.statusCode.should.equal(200);
			assert.isTrue(res._isEndCalled());
		});
	});
	describe('handleDeleteSession', () => {
		it('should return false if the needDeleteSession is true', () => {
			sandbox.stub(utils, 'isDeleteSession', () => {return true;});
			proxy.opts.needDeleteSession = true;

			proxy.handleDeleteSession(req, res).should.be.false;
		});
		it('should return false if a request is not a delete session', () => {
			sandbox.stub(utils, 'isDeleteSession', () => {return false;});
			proxy.opts.needDeleteSession = false;

			proxy.handleDeleteSession(req, res).should.be.false;
		});
		it('should return a fake respond that is a delete session', () => {
			sandbox.stub(utils, 'isDeleteSession', () => {return true;});
			sandbox.stub(utils, 'getSessionId', () => {return 'abc';});
			proxy.opts.needDeleteSession = false;

			proxy.handleDeleteSession(req, res).should.be.true;
			var data = JSON.parse(res._getData());
			data.status.should.equal(0);
			data.sessionId.should.equal('abc');
			assert.isNull(data.value);
			res.statusCode.should.equal(200);
			assert.isTrue(res._isEndCalled());
		});
	});
	describe('handleDeleteWindow', () => {
		it('should return false if the needDeleteSession is true', () => {
			sandbox.stub(utils, 'isDeleteWindow', () => {return true;});
			proxy.opts.needDeleteSession = true;

			proxy.handleDeleteWindow(req, res).should.be.false;
		});
		it('should return false if a request is not a delete session', () => {
			sandbox.stub(utils, 'isDeleteWindow', () => {return false;});
			proxy.opts.needDeleteSession = false;

			proxy.handleDeleteWindow(req, res).should.be.false;
		});
		it('should return a fake respond that is a delete session', () => {
			sandbox.stub(utils, 'isDeleteWindow', () => {return true;});
			sandbox.stub(utils, 'getSessionId', () => {return 'abc';});
			proxy.opts.needDeleteSession = false;

			proxy.handleDeleteWindow(req, res).should.be.true;
			var data = JSON.parse(res._getData());
			data.status.should.equal(0);
			data.sessionId.should.equal('abc');
			assert.isNull(data.value);
			res.statusCode.should.equal(200);
			assert.isTrue(res._isEndCalled());
		});
	});
	describe('forward', () => {
		beforeEach(() => {
			sandbox.stub(proxy.proxy, 'web');
		});
		it('should not forward if we have handled this in handleCreatedSession function', () => {
			sandbox.stub(proxy, 'handleCreatedSession', () => {return true;});
			sandbox.stub(proxy, 'handleDeleteSession', () => {return false;});
			

			proxy.forward(req, res);
			proxy.proxy.web.calledOnce.should.be.false;
		});
		it('should not forward if we have handled this in handleDeleteSession function', () => {
			sandbox.stub(proxy, 'handleCreatedSession', () => {return false;});
			sandbox.stub(proxy, 'handleDeleteSession', () => {return true;});

			proxy.forward(req, res);
			proxy.proxy.web.calledOnce.should.be.false;
		});
		it('should forward if we don\'t handle these', () => {
			sandbox.stub(proxy, 'handleCreatedSession', () => {return false;});
			sandbox.stub(proxy, 'handleDeleteSession', () => {return false;});

			proxy.forward(req, res);
			proxy.proxy.web.calledOnce.should.be.true;
		});
	});
	describe('proxyReqFunc', () => {
		var req;
		var testBody;
		beforeEach(() => {
			proxy.opts.capabilityIdentify = 'idtest';
			proxy.opts.commandTimeout = '600';
			testBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20',
					'idtest': 'abc'
				}
			};
			req = httpMocks.createRequest({
				'body': testBody
			});
			sandbox.stub(utils, 'printHttpRequest');
		});
		it('should write exactly what a request contains', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return false;});
			var proxyReq = {
				setHeader: (args) => {},
				write: (body) => {
					body.should.equal(JSON.stringify(testBody));
				}
			}

			proxy.proxyReqFunc(proxyReq, req, res);
			utils.printHttpRequest.calledOnce.should.be.true;
		});
		it('should update a new command timeout and remove the debug capability', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			let expectBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '600'
				}
			}
			let proxyReq = {
				setHeader: (args) => {},
				write: (body) => {
					body.should.equal(JSON.stringify(expectBody));
				}
			}

			proxy.proxyReqFunc(proxyReq, req, res);
			utils.printHttpRequest.calledOnce.should.be.true;
			req.body.should.equal(testBody);
		});
	});
	describe('proxyResFunc', () => {
		var testBody;
		var resultBody;
		beforeEach(() => {
			testBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20',
					'idtest': 'abc'
				}
			};
			resultBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20'
				},
				'sessionId': '123456789'
			};
			req = httpMocks.createRequest({
				'body': testBody
			});
			proxy.opts.capabilityIdentify = 'idtest';
			sandbox.stub(utils, 'printHttpRespond');
			sandbox.stub(utils, 'modifyResponse', (req, callback) => {
				callback(resultBody);
			});
		});
		it('should not save a current session if user need delete this session', () => {
			proxy.opts.needDeleteSession = true;

			proxy.proxyResFunc({}, req, res);
			utils.printHttpRespond.calledOnce.should.be.true;
			expect(proxy.sessionMap).to.not.have.property('abc');
		});
		it('should not save a current session if it is not a create session', () => {
			proxy.opts.needDeleteSession = false;
			sandbox.stub(utils, 'isCreateSession', () => {return false;});

			proxy.proxyResFunc({}, req, res);
			utils.printHttpRespond.calledOnce.should.be.true;
			expect(proxy.sessionMap).to.not.have.property('abc');
		});
		it('should not save a current session if it is not success', () => {
			proxy.opts.needDeleteSession = false;
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			sandbox.stub(utils, 'isSuccess', () => {return false;});

			proxy.proxyResFunc({}, req, res);
			utils.printHttpRespond.calledOnce.should.be.true;
			expect(proxy.sessionMap).to.not.have.property('abc');			
		});
		it('should backup a respond of a create session', () => {
			sandbox.stub(utils, 'isCreateSession', () => {return true;});
			sandbox.stub(utils, 'isSuccess', () => {return true;});
			proxy.opts.needDeleteSession = false;

			proxy.proxyResFunc({}, req, res);
			utils.printHttpRespond.calledOnce.should.be.true;
			expect(proxy.sessionMap['abc']).to.deep.equal(resultBody);
		});
	});
	describe('close', () => {
		beforeEach(() => {
			let sessionMap = {
				id1: {
					sessionId: '0a085e6e-b667-498f-b27c-23af3cee41e0'
				}
			}
			proxy.sessionMap = sessionMap;
			sandbox.stub(request, 'delete');
		});
		afterEach(() => {
			request.delete.restore();
			logger.info.restore();
		});
		it('should send a request to delete a session', () => {
			request.delete.yields(null, {statusCode: 200}, null);
			proxy.close();

			assert(request.delete.calledOnce);
			request.delete.getCall(0).args[0].url
				.should.equal('http://localhost:4723/wd/hub/session/0a085e6e-b667-498f-b27c-23af3cee41e0');
			logger.info.getCall(0).args[0].should.equal('DELETE 0a085e6e-b667-498f-b27c-23af3cee41e0 successful.')
			proxy.sessionMap.should.be.empty;
		});
		it('cannot delete a session', () => {
			request.delete.yields(null, {statusCode: 404}, null);
			proxy.close();

			assert(request.delete.calledOnce);
			request.delete.getCall(0).args[0].url
				.should.equal('http://localhost:4723/wd/hub/session/0a085e6e-b667-498f-b27c-23af3cee41e0');
			expect(logger.info.getCall(0).args[0]).to.contains('Cannot DELETE 0a085e6e-b667-498f-b27c-23af3cee41e0');
			proxy.sessionMap.should.be.empty;
		});
	});
});