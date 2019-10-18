const five = require("johnny-five");
const pixel = require("node-pixel");
const Raspi = require("raspi-io").RaspiIO;

const config = require('./config');
const MetarRequest = require('./metar_request').MetarRequest;

class NeoPixel{
  static execute(){
    const board = new five.Board({
      io: new Raspi(),
      repl: false
    });

    board.on("ready", function(){
      let strip = new pixel.Strip({
        color_order: pixel.COLOR_ORDER.GRB,
        board: this,
        controller: "I2CBACKPACK",
        strips: [21]
      });

      function updateMap(){
        console.log("Updating LEDs");
        try {
          const metars = MetarRequest.as_json();
          if(!metars.airports){ throw 'Airports not fetched' }

          config.airports.forEach(function(airport, i){
            let skyCondition = null;

            if(metars.airports[i].flight_category){
              skyCondition = metars.airports[i].flight_category._text
            }

            let ledColor = '';
            switch(skyCondition){
              case 'VFR':
                ledColor = config.led.colors.vfr
                break;
              case 'MVFR':
                ledColor = config.led.colors.mvfr
                break;
              case 'IFR':
                ledColor = config.led.colors.ifr
                break;
              case 'LIFR':
                ledColor = config.led.colors.lifr
                break;
            }

            //console.log("Updating " + airport + " to " + skyCondition + " (" + ledColor + ")");
            if(ledColor){
              strip.pixel(i).color(ledColor);
            } else {
              strip.pixel(i).off();
            }
          })
          strip.show();
        } catch(err){
          console.log("Failed to update LEDs: " + err);
        } finally {
          setTimeout(updateMap, 60 * 1000)
        }
      }

      strip.on("ready", function(){
        updateMap();
      });
    });
  }
}

module.exports = NeoPixel
