const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

const WeatherRequest = require('../../metar_request').WeatherRequest

class weatherDataCharacteristic extends bleno.Characteristic {
  constructor(ws){
    super({
      uuid: '8dc27e53-225f-40a5-a198-b401b7786a5b',
      properties:  ['write', 'notify'],
    })

    this.weatherData = [];
    this.updateValueCallback = null;

    this.ws = ws
    this.weatherDataCallback();

  }

  weatherDataCallback(){
    this.ws.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data)
      if(parsedMessage && parsedMessage.type == 'airports-and-categories'){
        this.weatherData = message.data
        this.sendResults();
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
    // Noone is subscribed
    if(!this.updateValueCallback){ return; }

    new BLETransport(JSON.stringify(this.getWeatherData), this.updateValueCallback).send();
  }

}

module.exports = { weatherDataCharacteristic }

