const assert = require('chai').assert;
const sinon = require('sinon');

const WeatherRequest = require('../lib/metar_request').WeatherRequest;

describe('WeatherRequest', function(){
  it.skip('calls the requied weather data', function(){
    // How doe we test this - it uses setInterval?
    assert.deepEqual(WeatherRequest.call(), 'expected call result');
  })

  it.skip('calls the specified weather requests on interval', function(){
    // FIXME how do we test this?
  });

  it('can convert minutes to miliseconds', function(){
    // 1 min is 60000 ms
    assert.deepEqual(WeatherRequest.convertMinutesToMiliseconds(1), 60000)
  })

  it.skip('returns its json', function(){
  })
})
