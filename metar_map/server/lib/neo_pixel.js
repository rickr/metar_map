let five = require("johnny-five");
let pixel = require("node-pixel");
let Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({ io: new Raspi() });

const config = require('./config')
const MetarRequest = require('./metar_request')

console.log(MetarRequest.as_json())

board.on("ready", function(){
  strip = new pixel.Strip({
      color_order: pixel.COLOR_ORDER.GRB,
      board: this,
      controller: "I2CBACKPACK",
      strips: [21]
  });

  strip.on("ready", function(WeatherRequest){
    console.log("Gogogo");
    console.log(config.airports);
  });
});
