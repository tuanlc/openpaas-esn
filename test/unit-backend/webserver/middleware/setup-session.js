'use strict';

const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');

describe('The setup-session middleware', function() {

  it('should be a function', function() {
    const setupSession = this.helpers.requireBackend('webserver/middleware/setup-sessions');

    expect(setupSession).to.be.a.function;
  });

  it('should set the middleware if the datastore is connected', function(done) {
    const mongooseMock = this.helpers.requireFixture('mongoose').mongoose();

    mongooseMock.connections = [true];

    const coreMock = {
      db: {
        mongo: {
          isConnected: function() { return true; }
        }
      },
      logger: { debug: function() {} },
      pubsub: {
        local: {
          topic: function() { return { subscribe: function() {}, publish: function() {} }; }
        }
      }
    };

    const session = {
      setMiddleware: function() {
        done();
      }
    };

    mockery.registerMock('mongoose', mongooseMock);
    mockery.registerMock('../../core', coreMock);

    const setupSession = this.helpers.requireBackend('webserver/middleware/setup-sessions');

    setupSession(session);

  });

  it('should register a subscription mongodb:connectionAvailable', function() {
    const mongooseMock = this.helpers.requireFixture('mongoose').mongoose();

    mongooseMock.connections = [true];

    const subscriptions = {};

    const coreMock = {
      db: {
        mongo: {
          isConnected: function() { return false; }
        }
      },
      logger: { debug: function() {} },
      pubsub: {
        local: {
          topic: function(topic) { return { subscribe: function(handler) { subscriptions[topic] = handler; } }; }
        }
      }
    };

    const session = {
      setMiddleware: function() {
      }
    };

    mockery.registerMock('mongoose', mongooseMock);
    mockery.registerMock('../../core', coreMock);

    const setupSession = this.helpers.requireBackend('webserver/middleware/setup-sessions');

    setupSession(session);
    expect(subscriptions).to.have.property('mongodb:connectionAvailable');
    expect(subscriptions['mongodb:connectionAvailable']).to.be.a.function;
  });

  it('should set the session middleware when mongodb:connectionAvailable is published', function(done) {
    const mongooseMock = this.helpers.requireFixture('mongoose').mongoose();

    mongooseMock.connections = [true];

    const subscriptions = {};

    const coreMock = {
      db: {
        mongo: {
          isConnected: function() { return false; }
        }
      },
      logger: { debug: function() {} },
      pubsub: {
        local: {
          topic: function(topic) {
            return {
              subscribe: function(handler) { subscriptions[topic] = handler; },
              publish: function() {}
            };
          }
        }
      }
    };

    const session = {
      setMiddleware: function() {
      }
    };

    mockery.registerMock('mongoose', mongooseMock);
    mockery.registerMock('../../core', coreMock);

    const setupSession = this.helpers.requireBackend('webserver/middleware/setup-sessions');

    setupSession(session);
    session.setMiddleware = function() {done();};
    subscriptions['mongodb:connectionAvailable']();

  });

  it('should use the cached MongoStore to set up session middleware when mongodb:connectionAvailable is published twice', function() {
    const mongooseMock = this.helpers.requireFixture('mongoose').mongoose();

    mongooseMock.connections = [true];

    const subscriptions = {};
    const coreMock = {
      db: {
        mongo: {
          isConnected: function() { return false; }
        }
      },
      logger: { debug: function() {} },
      pubsub: {
        local: {
          topic: function(topic) {
            return {
              subscribe: function(handler) { subscriptions[topic] = handler; },
              publish: function() {}
            };
          }
        }
      }
    };
    const MongoStoreSpy = sinon.spy();
    const awesomeSessionstoreMock = () => MongoStoreSpy;
    const session = { setMiddleware() {} };
    const expressSessionMock = function() {};

    mockery.registerMock('mongoose', mongooseMock);
    mockery.registerMock('../../core', coreMock);
    mockery.registerMock('awesome-sessionstore', awesomeSessionstoreMock);
    mockery.registerMock('express-session', expressSessionMock);

    const setupSession = this.helpers.requireBackend('webserver/middleware/setup-sessions');

    setupSession(session);

    subscriptions['mongodb:connectionAvailable']();
    subscriptions['mongodb:connectionAvailable']();

    expect(MongoStoreSpy).to.have.been.calledOnce;
  });

});
