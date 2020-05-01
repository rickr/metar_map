const bleno = require('@abandonware/bleno');
const {ipCharacteristic} = require('./mapService/ipCharacteristic');
const {weatherDataCharacteristic} = require('./mapService/weatherDataCharacteristic');
const {lightStatusCharacteristic} = require('./mapService/lightStatusCharacteristic');

class mapService {
  static uuid(){ return 'a5023bbe-29f9-4385-ab43-a9b3600ab7c4' }

  constructor(ws){
    this.uuid = mapService.uuid();
    this.ws = ws
    console.log('ws is ' + ws);

    return(new bleno.PrimaryService({
      uuid: this.uuid,
      characteristics: [
        new ipCharacteristic(),
        new weatherDataCharacteristic(this.ws),
        new lightStatusCharacteristic(this.ws),
      ]
    }))
  }
}

module.exports = mapService;
