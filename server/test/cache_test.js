const assert = require('assert')
const Cache = require('../lib/cache');

describe('Const', function(){
  it('can be store and retrieve a value', function(){
    let cache = new Cache(5)
    cache.store(1)

    assert.deepEqual(cache.values, [ 1 ])
  });

  it('can only stores up to the max value', function(){
    let cache = new Cache(3)
    cache.store(1)
    cache.store(2)
    cache.store(3)
    cache.store(4)

    assert.deepEqual(cache.values, [ 2, 3, 4 ])
  });
})
