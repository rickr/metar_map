const bleno = require('@abandonware/bleno');
const {ipCharacteristic} = require('./mapService/ipCharacteristic');
const {weatherDataCharacteristic} = require('./mapService/weatherDataCharacteristic');
const {lightStatusCharacteristic} = require('./mapService/lightStatusCharacteristic');
const Services = require('./services');

//
// The Map Service deals with map data and command/control (light status, modes etc)
//

class mapService {
  static uuid(){ return Services.mapService.uuid }

  constructor(ws){
    this.uuid = mapService.uuid();
    this.ws = ws

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
