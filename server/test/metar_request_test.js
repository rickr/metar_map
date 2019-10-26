const assert = require('chai').assert;
const sinon = require('sinon');

const MetarRequest = require('../lib/metar_request').MetarRequest;

describe('MetarRequest', function(){
  before(function(){
    // FIXME Config should be mocked or a separate test one created
    this.stationString = '&stationString=KSMQ,KFWN,KMMU,KLDJ,KEWR,KCDW,KTEB,KLGA,KJFK,KFRG,KISP,KHWV,KFOK,KHTO,KWST,KGON,KSNC,KHVN,KBDR,KDXR,KHPN';
    this.expectedUrl = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?' +
                       'dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecentForEachStation=true' + 
                       this.stationString
  })

  it('can return params', function(){
    const expectedParams = {
      dataSource: 'metars',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: '3',
      mostRecentForEachStation: 'true'
    }

    assert.deepEqual(MetarRequest.params(), expectedParams);
  });

  it('knows its filename', function(){
    assert.deepEqual(MetarRequest.fileName(), '/tmp/metar');
  })

  it('has an station string', function(){
    assert.deepEqual(MetarRequest.stationString(), this.stationString);
  })

  it('returns its url', function(){
    assert.deepEqual(MetarRequest.url(), this.expectedUrl)
  })

  it.skip('returns its data as json', function(){
    // FIXME Mock metar request
    const result = MetarRequest.as_json();
    assert.deepEqual(result, 'expected json result');
  })

  it.skip('executes', function(){
    assert.deepEqual(MetarRequest.as_json(), 'expected executes result');
  })
})
