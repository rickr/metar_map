require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.ENV == 'production' ? 80 : 4567;
const https = require('https');
const convert = require('xml-js');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process')
const readline = require('readline');

const app = express();
enableWs(app)

// Local libs
const Config = require('./lib/config')
const MetarRequest = require('./lib/metar_request').MetarRequest
const TafRequest = require('./lib/metar_request').TafRequest
const WeatherRequest = require('./lib/metar_request').WeatherRequest
const MapLightController = require('./lib/map_light_controller');
const Cache = require('./lib/cache');
const mapLightController = MapLightController.create()

const logger = require('./lib/logger')('server');

app.use(bodyParser.json());
app.use(cors());

class Message{
  constructor(message){
    this.parsedMessage = JSON.parse(message)
    this.type = Object.keys(this.parsedMessage)[0]
    this.payload = Object.values(this.parsedMessage)[0]
  }
}

app.ws('/metar.ws', (ws, req) => {
  ws.on('message', (msg) => {
    const message = new Message(msg)

    switch(message.type){
      case "subscribe":
        switch(message.payload){
          case "metars":
            logger.info("metars RX");
            sendMetarData(ws);
            break;
          case "logs":
            logger.info("log message RX");
            sendLogData(ws);
            break;
        }
        break;
      case "leds":
        switch(message.payload){
          case true:
            logger.info("ledState on");
            mapLightController.lightsOn();
            break;
          case false:
            logger.info("ledState off");
            mapLightController.lightsOff();
            break;
          default:
            logger.info("Unknown leds message: " + msg);
            break;
        }
        break;
      case "data":
        switch(message.payload){
          case 'update':
            logger.info("Updating data");
            WeatherRequest.update();
            sendMetarData(ws, false);
            break;
          default:
            logger.info("Unknown data message: " + msg);
            break;
        }
      default:
        logger.info("RX unknown message type'" + msg + "'");
        break;
    }
  })
})

// Serve our production build
app.use(express.static(path.join(__dirname, '../client/build')));

sendLogData = (ws) => {
  let logLines = new Cache(100)

  logger.info("Sending log data");
  const latestLines = spawn('tail', ['-100', Config.log_file]);
  latestLines.stdout.on('data', (line) => { logLines.store(line.toString()) })

  const tail = spawn('tail', ['-F', Config.log_file]);

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

function sendMetarData(ws, repeat=true){
  logger.info("Sending metar data");
  if(!ws){ logger.info("WS is null"); return false }

  if(ws.readyState === 1){
    let payload = WeatherRequest.json();

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

    if(repeat) { setTimeout(sendMetarData, 10 * 1000, ws) };
  }else{
    logger.info("Unknown ready state: " + ws.readyState);
  }
}

// Begin fetching metars
WeatherRequest.call();
mapLightController.call();

app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`))

