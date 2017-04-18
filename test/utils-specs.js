import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import httpMocks from 'node-mocks-http';
import * as utils from '../lib/utils';
import logger from '../lib/logger';

let sandbox = sinon.sandbox.create();
let expect = chai.expect;
let assert = chai.assert;
chai.should();

describe('utils', () => {
	afterEach(() => {
		sandbox.restore();
	});
	describe('getSessionId', () => {
		it('should get right sessionId', () => {
			let req = httpMocks.createRequest({
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49'
			});
			utils.getSessionId(req).should.equal('43f3e91a-2606-496c-a554-828f14ba3a49');
		});
		it('should get right sessionID in window deletion request', () => {
			let req = httpMocks.createRequest({
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49/window'
			});
			utils.getSessionId(req).should.equal('43f3e91a-2606-496c-a554-828f14ba3a49');
		});
		it('should return empty string if there is invalid url', () => {
			let req = httpMocks.createRequest({
				url: '/status'
			});
			utils.getSessionId(req).should.be.empty;
		});	
	});
	describe('isCreateSession', () => {
		it('should return true if a method is POST and a url is session', () => {
			let req = httpMocks.createRequest({
				method: 'POST',
				url: '/session'
			});
			utils.isCreateSession(req).should.be.true;
		});
		it('should return false if a method is not POST', () => {
			let req = httpMocks.createRequest({
				method: 'GET',
				url: '/session'
			});
			utils.isCreateSession(req).should.be.false;
		});
		it('should retun false if a url is not session', () => {
			let req = httpMocks.createRequest({
				method: 'POST',
				url: '/status'
			});
			utils.isCreateSession(req).should.be.false;
		});
	});
	describe('isDeleteWindow', () => {
		it('should return true if a method is DELETE and a url is /session/:sessionid/window', () => {
			let req = httpMocks.createRequest({
				method: 'DELETE',
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49/window'
			});
			utils.isDeleteWindow(req).should.be.true;
		});
		it('should return false if a method is not DELETE', () => {
			let req = httpMocks.createRequest({
				method: 'POST',
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49/window'
			});
			utils.isDeleteWindow(req).should.be.false;
		});
		it('should return false if a url is not /session/:sessionid/window', () => {
			let req = httpMocks.createRequest({
				method: 'DELETE',
				url: '/session'
			});
			utils.isDeleteWindow(req).should.be.false;
		});
	});
	describe('isDeleteSession', () => {
		it('should return true if a method is DELETE and a url is /session/:sessionid', () => {
			let req = httpMocks.createRequest({
				method: 'DELETE',
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49'
			});
			utils.isDeleteSession(req).should.be.true;
		});
		it('should return false if a method is not DELETE', () => {
			let req = httpMocks.createRequest({
				method: 'POST',
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49'
			});
			utils.isDeleteSession(req).should.be.false;
		});
		it('should return false if a url is not /session/:sessionid/window', () => {
			let req = httpMocks.createRequest({
				method: 'DELETE',
				url: '/session'
			});
			utils.isDeleteSession(req).should.be.false;
		});
	});
	describe('isSuccess', () => {
		it('should return true if statusCode is 200', () => {
			let res = {
				statusCode: 200
			};
			utils.isSuccess(res).should.be.true;
		});
		it('should return false if statusCode is 404', () => {
			let res = {
				statusCode: 404
			};
			utils.isSuccess(res).should.be.false;
		});
	});
	describe('printHttpRequest', () => {
		it('should return colorful log', () => {
			let req = httpMocks.createRequest({
				method: 'DELETE',
				url: '/session/43f3e91a-2606-496c-a554-828f14ba3a49',
				body: {'test': 'ok'}
			});			
			sandbox.stub(logger, 'debug', (data) => {
				expect(data).to.contain('DELETE');
				expect(data).to.contain('/session/43f3e91a-2606-496c-a554-828f14ba3a49');
				expect(data).to.contain(JSON.stringify(req.body));
			});
			utils.printHttpRequest(req);
		});
	});
	describe('printHttpRespond', () => {
		it('should return colorful log', () => {
			let res = {
				statusCode: 200
			};
			let body = {'test': 'ok'};
			sandbox.stub(logger, 'debug', (data) => {
				expect(data).to.contain('200');
				expect(data).to.contain(JSON.stringify(body));
			});
			utils.printHttpRespond(res, body);
		});
	});
	describe('getCapabilities', () => {
		it('should return desiredCapabilities object', () => {
			let testBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20',
					'idtest': 'abc'
				}
			};
			let caps = utils.getCapabilities(testBody);
			caps.newCommandTimeout.should.equal('20');
			caps.idtest.should.equal('abc');
		});	
	});
	describe('getIdentifySessionValue', () => {
		it('should return right value of identify cap', () => {
			let testBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20',
					'idtest': 'abc'
				}
			};
			utils.getIdentifySessionValue(testBody, 'idtest').should.equal('abc');
		});
	});
	describe('modifyResponse', () => {
		var res;
		var testBody;
		beforeEach(() => {
			res = httpMocks.createResponse({ 
				eventEmitter: require('events').EventEmitter
			});
			testBody = {
				'desiredCapabilities': {
					'newCommandTimeout': '20',
					'idtest': 'abc'
				}
			};
			res.write(testBody);
		});
		it('should retrieve correct body, no change body', () => {
			utils.modifyResponse(res, (body) => {
				var caps = body['desiredCapabilities'];
				caps.newCommandTimeout.should.equal('20');
				caps.idtest.should.equal('abc');
			});
		});
	});
});