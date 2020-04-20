const bleno = require('@abandonware/bleno');
const os = require('os');
const BLETransport = require('../BLETransport')

class ipCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: '17137bb3-57c4-4064-afc9-288965035881',
      properties:  ['read'],
      value: null
    })

    this.ip = this.fetchIP();
  }

  development(){ return os.arch() !== 'arm' }

  fetchIP(){
    const networkInterfaces = os.networkInterfaces();

    if(this.development()){
      return networkInterfaces.wlp2s0[0].address
    } else {
      return networkInterfaces.wlan0[0].address
    }
  }

  onReadRequest(offset, callback){
    console.log('IP ' + this._value);
    callback(this.RESULT_SUCCESS, BLETransport.send(this.ip));
  }
}

module.exports = { ipCharacteristic }

