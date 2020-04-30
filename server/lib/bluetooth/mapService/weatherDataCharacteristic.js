const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

const WeatherRequest = require('../../metar_request').WeatherRequest

class weatherDataCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: '8dc27e53-225f-40a5-a198-b401b7786a5b',
      properties:  ['write', 'notify'],
    })

    this.updateValueCallback = null;
  }

  getWeatherData(){
    return WeatherRequest.airportsAndCategories() 
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request Airports");
    if(data.toString('utf8') == '1'){
      console.log('Sending')
      this.sendResults()
    } else {
      console.log('disabled')
    };
    callback(this.RESULT_SUCCESS);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("On Subscribe Airports");
    this.updateValueCallback = updateValueCallback
  }

  sendResults(){
    new BLETransport(JSON.stringify(this.getWeatherData()), this.updateValueCallback).send();
  }

}

module.exports = { weatherDataCharacteristic }

