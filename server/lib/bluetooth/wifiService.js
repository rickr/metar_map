const bleno = require('@abandonware/bleno');
const scanCharacteristic = require('./wifiService/scanCharacteristic');
const internetConnectionStatusCharacteristic = require('./wifiService/internetConnectionStatusCharacteristic');
const connectionCharacteristic = require('./wifiService/connectionCharacteristic');

const Services = require('./services')

//
// The Wifi service deals with scanning for wifi, connecting, and disconnecting
//

class wifiService {
  static uuid(){ return Services.wifiService.uuid }

  constructor(){
    this.uuid = wifiService.uuid()

    return(new bleno.PrimaryService({
      uuid: this.uuid,
      characteristics: [
        new scanCharacteristic(),
        new internetConnectionStatusCharacteristic(),
        new connectionCharacteristic()
      ]
    }))
  }
}

module.exports = wifiService;
