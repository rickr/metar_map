const os = require('os');
const config = require('./config');
const MetarRequest = require('./metar_request').MetarRequest;

class MapLightController{
  constructor(){
    this.updateInterval = 10 //seconds
    this.timeout = null
  }

  static create(){
    if(os.arch() == 'arm'){
      // FIXME - check our config for the driver
      return new NeoPixelMapLightController()
    } else{
      return new TestMapLightController()
    }
  }

  call(){ this.updateMap(); }

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
    this.logger.info("Updating LEDs");
    try {
      const metars = MetarRequest.json();
      if(!metars.airports){ throw 'Airports not fetched' }

      config.airports.forEach((airport_id, i) => {
        let airport = metars.airports[i]
        let skyCondition = null;

        if(airport && airport.flight_category){ skyCondition = airport.flight_category._text }

        const ledColor = this.skyConditionToColor(skyCondition);
        this.logger.debug("Updating " + airport_id + " (" + i + ") to " + skyCondition + " (" + ledColor + ")");

        if(ledColor){
          this.setColor(i, ledColor)
        } else {
          //strip.pixel(i).off();
        }

      })
      this.sendToLEDs();
    } catch(err){
      this.logger.info("Failed to update LEDs: " + err);
    } finally {
      this.timeout = setTimeout(() => { this.updateMap() }, this.updateInterval * 1000)
    }
  }

  lightsOn(){ this.updateMap(); };
  lightsOff(){ clearTimeout(this.timeout) };
}

// FIXME How in the hell can we get this to exist in another file...
// This uses node-pixel with an I2C backpack.
// Installation instructions here:
//   https://github.com/ajfisher/node-pixel/blob/master/docs/installation.md
//
// In short:
//   $ interchange install git+https://github.com/ajfisher/node-pixel -a nano
//
// Then:
//  Open up the arduino IDE, navigate to firmware/build/backpack/ and
//  open backpack.ino. This will bring in all the required dependencies.

class NeoPixelMapLightController extends MapLightController{
  constructor(){
    super();

    this.logger = require('./logger')('NeoPixelMapLightController');

    this.five = require("johnny-five");
    this.pixel = require("node-pixel");
    this.Raspi = require("raspi-io").RaspiIO;

    this.board = this._createBoard();
    this.strip = this._createStrip();
  }

  _createBoard(){
    return new this.five.Board({
      io: new this.Raspi(),
      repl: false
    })
  }

  _createStrip(){
    return new this.pixel.Strip({
      color_order: this.pixel.COLOR_ORDER.GRB,
      board: this.board,
      controller: "I2CBACKPACK",
      strips: [config.airports.length]
    })
  }

  call(){
    this.board.on("ready", () => {
      this.strip.on("ready", () => {
        this.updateMap();
      })
    })
  }

  sendToLEDs(){
    this.strip.show();
  }

  setColor(i, ledColor){
    this.strip.pixel(i).color(ledColor);
  }

  lightsOff(){
    super.lightsOff();
    this.strip.off();
  }

}

// Driver for testing and non RPI boards
class TestMapLightController extends MapLightController{
  constructor(){
    // Board and strip setup
    super();
    this.logger = require('./logger')('TestMapLightController');
  }

  sendToLEDs(){
    this.logger.debug('Would call strip.show()');
  }

  setColor(i, ledColor){
    this.logger.debug('Updating index ' + i + ' to color ' + ledColor);
  }

  lightsOff(){
    super.lightsOff();
    console.log("Lights off!")
  };
}

module.exports = MapLightController
