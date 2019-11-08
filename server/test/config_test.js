const assert = require('chai').assert;
const sinon = require('sinon');

describe('Config', function(){
  it('can load a config file', function(){
    // FIXME this should get stubbed
    const fs = require('fs');
    const config = require('../lib/config');
    assert.notEmpty(config);
  });

  // TODO
  it.skip('raises if passed an invalid file', function(){ });
})
