let five = require("johnny-five");
let pixel = require("node-pixel");
let Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({
  io: new Raspi(),
  repl: false
});

const config = require('./config');
const MetarRequest = require('./metar_request').MetarRequest;

board.on("ready", function(){
  strip = new pixel.Strip({
    color_order: pixel.COLOR_ORDER.GRB,
    board: this,
    controller: "I2CBACKPACK",
    strips: [21]
  });

  function updateMap(){
    const metars = MetarRequest.as_json();

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

      console.log("Updating " + airport + " to " + skyCondition + " (" + ledColor + ")");
      if(ledColor){
        strip.pixel(i).color(ledColor);
      } else {
        strip.pixel(i).off();
      }
    })
    strip.show();
    setTimeout(updateMap, 1000 * 10)
  }

  strip.on("ready", function(){
    updateMap();
  });
});