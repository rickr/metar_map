const os = require('os');
const config = require('./config');
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
      setTimeout(() => { this.updateMap() }, this.updateInterval * 1000)
    }
  }
}

// FIXME How in the hell can we get this to exist in another file...
class NeoPixelMapLightController extends MapLightController{
  constructor(){
    super();

    this.logger = require('./logger')('TestMapLightController');

    const five = require("johnny-five");
    const pixel = require("node-pixel");
    const Raspi = require("raspi-io").RaspiIO;

    this.board = _createBoard();
    this.strip = _createStrip();
  }

  _createBoard(){
    return new five.Board({
      io: new Raspi(),
      repl: false
    })
  }

  _createStrip(){
    return new pixel.Strip({
      color_order: pixel.COLOR_ORDER.GRB,
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
    strip.show();
  }

  setColor(i, ledColor){
    strip.pixel(i).color(ledColor);
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
}

module.exports = MapLightController
