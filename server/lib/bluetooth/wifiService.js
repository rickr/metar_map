const bleno = require('@abandonware/bleno');
const scanCharacteristic = require('./wifiService/scanCharacteristic');
const internetConnectionStatusCharacteristic = require('./wifiService/internetConnectionStatusCharacteristic');
const connectionCharacteristic = require('./wifiService/connectionCharacteristic');

class wifiService {
  static uuid(){ return 'ed6695dd-be8a-44d6-a11d-cb3348faa85a' }

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
