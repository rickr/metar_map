const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

class airportCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: '7d17ff43-b02a-4586-a488-5a7fd0bc8856',
      properties:  ['read'],
      lastUpdated: null
    })

    this.ip = this.lastUpdated();
  }

  onReadRequest(offset, callback){
    console.log('IP ' + this.ip);
    callback(this.RESULT_SUCCESS, BLETransport.send(this.ip));
  }

  lastUpdate(){
    return{'yesterday....all my troubles seemed so far away');
  }
}

module.exports = { ipCharacteristic }

