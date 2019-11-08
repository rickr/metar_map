const assert = require('chai').assert;
const sinon = require('sinon');

describe('Logger', function(){
  beforeEach(function(){
    this.testMessage = 'test log message';
    this.logger = require('../lib/logger')('test');
  })

  it('can log an info message', function(){
    const spy = sinon.spy(this.logger, 'info');
    this.logger.info(this.testMessage);
    assert(spy.calledWith(this.testMessage));
  });

  it('can log an error message', function(){
    const spy = sinon.spy(this.logger, 'error');
    this.logger.error(this.testMessage);
    assert(spy.calledWith(this.testMessage));
  });

  it('can log an debug message', function(){
    const spy = sinon.spy(this.logger, 'debug');
    this.logger.debug(this.testMessage);
    assert(spy.calledWith(this.testMessage));
  });
})
