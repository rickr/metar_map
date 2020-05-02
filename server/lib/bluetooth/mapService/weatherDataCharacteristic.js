const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

const Services = require('../services')

const WeatherRequest = require('../../metar_request').WeatherRequest

class weatherDataCharacteristic extends bleno.Characteristic {
  constructor(ws){
    super({
      uuid: Services.mapService.characteristics.weatherData,
      properties:  ['write', 'notify'],
    })

    this.weatherData = [];
    this.updateValueCallback = null;

    this.ws = ws
    this.weatherDataCallback();

  }

  weatherDataCallback(){
    this.ws.onmessage = (message) => {
      try{
        const parsedMessage = JSON.parse(message.data)
        if(parsedMessage && parsedMessage.type == 'airports-and-categories'){
          this.weatherData = parsedMessage.payload
          this.sendResults();
        }
      }catch(error){
        console.log("Error:");
        console.log(error);
      }
    }
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request Airports");
    if(data.toString('utf8') == '1'){
      console.log('Subscribed To Airport Data')
      this.sendResults()
    };
    callback(this.RESULT_SUCCESS);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("On Subscribe Airports");
    this.updateValueCallback = updateValueCallback
  }

  sendResults(){
    new BLETransport(JSON.stringify(this.weatherData), this.updateValueCallback).send();
  }
}

module.exports = { weatherDataCharacteristic }

