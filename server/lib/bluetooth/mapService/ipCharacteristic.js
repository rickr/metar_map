const bleno = require('@abandonware/bleno');
const os = require('os');
const BLETransport = require('../BLETransport')
const Services = require('../services')

class ipCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: Services.mapService.characteristics.ip,
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
    console.log('IP ' + this.ip);
    callback(this.RESULT_SUCCESS, BLETransport.send(this.ip));
  }
}

module.exports = { ipCharacteristic }

