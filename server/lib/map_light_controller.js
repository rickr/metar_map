const os = require('os');
const config = require('./config');
const logger = require('./logger')('MapLightController');
const MetarRequest = require('./metar_request').MetarRequest;

class MapLightController{
  constructor(){
    this.updateInterval = 10 //seconds
  }

  static create(){
    if(os.arch() == 'arm'){
      // FIXME - check our config for the driver
      console.log("ARM platform, get the right driver");
    } else{
      return new TestMapLightController()
    }
  }

  skyConditionToColor(skyCondition){
    switch(skyCondition){
      case 'VFR':
        return config.led.colors.vfr
        break;
      case 'MVFR':
        return config.led.colors.mvfr
        break;
      case 'IFR':
        return config.led.colors.ifr
        break;
      case 'LIFR':
        return config.led.colors.lifr
        break;
      default:
        return null;
    }
  }

  updateMap(){
    logger.info("Updating LEDs");
    try {
      const metars = MetarRequest.json();
      if(!metars.airports){ throw 'Airports not fetched' }

      config.airports.forEach((airport_id, i) => {
        let airport = metars.airports[i]
        let skyCondition = null;

        if(airport && airport.flight_category){ skyCondition = airport.flight_category._text }

        const ledColor = this.skyConditionToColor(skyCondition);
        logger.debug("Updating " + airport_id + " (" + i + ") to " + skyCondition + " (" + ledColor + ")");

        if(ledColor){
          this.setColor(i, ledColor)
        } else {
          //strip.pixel(i).off();
        }

      })
      this.sendToLEDs();
    } catch(err){
      logger.info("Failed to update LEDs: " + err);
    } finally {
      setTimeout(() => { this.updateMap() }, this.updateInterval * 1000)
    }
  }
}

class TestMapLightController extends MapLightController{
  constructor(){
    super();
    // Board and strip setup
  }

  sendToLEDs(){
    console.log('strip.show()');
    //strip.show();
  }

  setColor(i, ledColor){
    console.log('Updating index ' + i + ' to color ' + ledColor);
    //strip.pixel(i).color(ledColor);
  }

}

let m = MapLightController.create()
m.updateMap();
module.exports = MapLightController
