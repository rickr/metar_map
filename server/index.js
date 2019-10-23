require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4567;
const https = require('https');
const convert = require('xml-js');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process')
const readline = require('readline');

const app = express();
enableWs(app)

// Local libs
const config = require('./lib/config')
const MetarRequest = require('./lib/metar_request').MetarRequest
const TafRequest = require('./lib/metar_request').TafRequest
const WeatherRequest = require('./lib/metar_request').WeatherRequest
let NeoPixel = null
if(os.arch() == 'arm'){ NeoPixel = require('./lib/neo_pixel') };
const logger = require('./lib/logger')('server');
const Cache = require('./lib/cache');

app.use(bodyParser.json());
app.use(cors());

app.ws('/metar.ws', (ws, req) => {
  ws.on('message', (message) => {
    switch(message){
      case "metars":
        logger.info("metars RX");
        sendMetarData(ws);
        break;
      case "hello":
        logger.info("hello RX");
        break;
      case "logs":
        logger.info("log message RX");
        sendLogData(ws);
        break;
      default:
        logger.info("RX unknown message '" + message + "'");
        break;
    }
  })
})

// Serve our production build
app.use(express.static(path.join(__dirname, '../client/build', 'index.html')));

sendLogData = (ws) => {
  let logLines = new Cache(100)

  logger.info("Sending log data");
  const latestLines = spawn('tail', ['-100', config.log_file]);
  latestLines.stdout.on('data', (line) => { logLines.store(line.toString()) })

  logger.info(logLines.length);

  const tail = spawn('tail', ['-F', config.log_file]);

  if(!ws){ logger.info("WS is null"); return false }
  if(ws.readyState === 1){
    tail.stdout.on('data', (line) => {
      logLines.store(line.toString());
      if(ws.readyState === 1){
        ws.send(JSON.stringify({
          type: "logs",
          payload: logLines
        }));
      }
    })
  }
}

function sendMetarData(ws){
  logger.info("Sending metar data");
  if(!ws){ logger.info("WS is null"); return false }

  if(ws.readyState === 1){
    let payload = WeatherRequest.as_json();

    if(payload.has_errors){
      ws.send(JSON.stringify({
        type: 'error',
        payload: payload
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'metars',
        payload: payload
      }));
    }

    // Make this configurable
    setTimeout(sendMetarData, 10 * 1000, ws)
  }else{
    logger.info("Unknown ready state: " + ws.readyState);
  }
}


// Begin fetching metars
WeatherRequest.execute();
if(os.arch() == 'arm' ){ NeoPixel.execute() }

app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`))

