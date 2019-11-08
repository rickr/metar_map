const assert = require('chai').assert;
const sinon = require('sinon');

const TafRequest = require('../lib/metar_request').TafRequest;

describe('TafRequest', function(){
  before(function(){
    // FIXME Config should be mocked or a separate test one created
    this.stationString = '&stationString=KSMQ,KFWN,KMMU,KLDJ,KEWR,KCDW,KTEB,KLGA,KJFK,KFRG,KISP,KHWV,KFOK,KHTO,KWST,KGON,KSNC,KHVN,KBDR,KDXR,KHPN';
    this.expectedUrl = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?' +
                       'dataSource=metars&requestType=retrieve&format=xml&hoursBeforeNow=3&mostRecentForEachStation=true' + 
                       this.stationString
  })

  it('can return params', function(){
    const expectedParams = {
      dataSource: 'tafs',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: '3',
      mostRecentForEachStation: 'true'
    }

    assert.deepEqual(TafRequest.params(), expectedParams);
  });

  it('knows its filename', function(){
    assert.deepEqual(TafRequest.fileName(), '/tmp/taf');
  })

  it('has a requestName', function(){
    assert.deepEqual(TafRequest.requestName(), 'TAF');
  });

  it.skip('orders its data', function(){
    assert.deepEqual(TafRequest.as_json(), 'expected executes result');
  })
})
