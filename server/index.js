require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.METAR_MAP_ENV == 'production' ? 80 : 4567;
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

const BLEPeripheral = require('./lib/bluetooth/BLEPeripheral');

const logger = require('./lib/logger')('server');

app.use(bodyParser.json());
app.use(cors());

// A message has the format of
// { type: TYPE, payload: PAYLOAD}
class Message{
  constructor(message){
    this.parsedMessage = JSON.parse(message)
    this.type = Object.keys(this.parsedMessage)[0]
    this.payload = Object.values(this.parsedMessage)[0]
  }
}

// Message Types
const SUBSCRIBE = 'subscribe';
const LEDS = 'leds';
const DATA = 'data';

// Message Subtypes
//   Subscription
const METARS = 'metars'
const AIRPORTS_AND_CATEGORIES = 'airports-and-categories'
const LOGS = 'logs'
//   LEDS
const ON = true
const OFF = false
const STATUS = 'status'
//   DATA
const UPDATE = 'update'


app.ws('/metar.ws', (ws, req) => {
  ws.on('message', (msg) => {
    const message = new Message(msg)

    switch(message.type){
      case SUBSCRIBE:
        switch(message.payload){
          case METARS:
            logger.info("metars RX");
            sendData(ws, 'metar-data', WeatherRequest.json())
            break;
          case AIRPORTS_AND_CATEGORIES:
            sendData(ws, 'airports-and-categories', WeatherRequest.airportsAndCategories());
            break;
          case LOGS:
            logger.info("log message RX");
            sendLogData(ws);
            break;
        }
        break;
      case LEDS:
        switch(message.payload){
          case ON:
            logger.info("ledState on");
            mapLightController.lightsOn();
            break;
          case OFF:
            logger.info("ledState off");
            mapLightController.lightsOff();
            break;
          case STATUS:
            console.log('Sending', mapLightController.getLightStatus());
            sendData(ws, 'light-status', mapLightController.getLightStatus(), false)
            break;
          default:
            logger.info("Unknown leds message: " + msg);
            break;
        }
        break;
      case DATA:
        switch(message.payload){
          case UPDATE:
            logger.info("Updating data");
            WeatherRequest.update();
            sendData(ws, 'metar-data', WeatherRequest.json(), false)
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

sendMetarData = (ws, repeat=true) => {
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

sendData = (ws, payloadName, payload, repeat=true) => {
  logger.info('Sending ' + payloadName + ' data');
  if(!ws){ logger.info("WS is null"); return false }

  if(ws.readyState === 1){
    if(payload.has_errors){
      ws.send(JSON.stringify({
        type: 'error',
        payload: payload
      }));
    } else {
      ws.send(JSON.stringify({
        type: payloadName,
        payload: payload,
      }));
    }

    if(repeat) { setTimeout(sendData, 10 * 1000, ws, payloadName, payload, repeat) };
  }else{
    logger.info("Unknown ready state: " + ws.readyState);
  }
}

// Begin fetching metars
WeatherRequest.call();
mapLightController.call();

// Start Bluetooth device
(new BLEPeripheral).call();

app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`))

