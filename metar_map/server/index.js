require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4567; const https = require('https');
const convert = require('xml-js');
const os = require('os');

const app = express();
enableWs(app)

// Local libs
const config = require('./lib/config')
const MetarRequest = require('./lib/metar_request').MetarRequest
const TafRequest = require('./lib/metar_request').TafRequest
const WeatherRequest = require('./lib/metar_request').WeatherRequest
let NeoPixel = null
if(os.arch() == 'arm'){ NeoPixel = require('./lib/neo_pixel') };

app.use(bodyParser.json());
app.use(cors());

app.ws('/metar.ws', (ws, req) => {
  sendMetarData(ws);

  ws.on('message', (message) => {
    switch(message){
      case "metars":
        console.log("metars RX");
      case "hello":
        console.log("hello RX");
      case "logs":
        console.log("log message RX");
    }
  })
})

// Serve our production build
app.use(express.static(path.join(__dirname, '../client/build')));


function sendMetarData(ws){
  if(ws.readyState === 1){
    let payload = WeatherRequest.as_json();

    if(payload.has_errors){
      ws.send(JSON.stringify(
        {
          type: 'error',
          payload: payload
        }
      ));
    } else {
      ws.send(JSON.stringify(
        { type: 'metar',
          payload: payload
        }
      ));
    }

    setTimeout(sendMetarData, 10 * 1000, ws)
  }else{
    console.log("Unknown ready state: " + ws.readyState);
  }
}


// Begin fetching metars
WeatherRequest.execute();
if(os.arch() == 'arm' ){ NeoPixel.execute() }

app.listen(port, () => console.log(`Metar Map listening on port ${port}!`))

