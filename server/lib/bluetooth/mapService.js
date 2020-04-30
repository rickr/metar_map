const bleno = require('@abandonware/bleno');
const {ipCharacteristic} = require('./mapService/ipCharacteristic');
const {weatherDataCharacteristic} = require('./mapService/weatherDataCharacteristic');

class mapService {
  static uuid(){ return 'a5023bbe-29f9-4385-ab43-a9b3600ab7c4' }

  constructor(){
    this.uuid = mapService.uuid();

    return(new bleno.PrimaryService({
      uuid: this.uuid,
      characteristics: [
        new ipCharacteristic(),
        new weatherDataCharacteristic(),
      ]
    }))
  }
}

module.exports = mapService;
