require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const convert = require('xml-js');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process')
const readline = require('readline');

const app = express();
enableWs(app)

// Local libs
const getPort = require('./lib/getPort');
const port = getPort();
const Config = require('./lib/config')
const MetarRequest = require('./lib/metar_request').MetarRequest
const TafRequest = require('./lib/metar_request').TafRequest
const WeatherRequest = require('./lib/metar_request').WeatherRequest
const MapLightController = require('./lib/map_light_controller');
const Cache = require('./lib/cache');
const mapLightController = MapLightController.create()

const BLEPeripheral = require('./lib/bluetooth/BLEPeripheral');

const logger = require('./lib/logger')('server');

const Message = require('./lib/message');
const messageTypes = require('./lib/message_types');

app.use(bodyParser.json());
app.use(cors());

app.ws('/metar.ws', (ws, req) => {
  ws.on('message', (msg) => {
    const message = new Message(msg)
    switch(message.type){
      case messageTypes.SUBSCRIBE:
        switch(message.payload){
          case messageTypes.subscribe.METARS:
            logger.info("metars RX");
            // This might have broken the ios app
            //sendData(ws, 'metar-data', WeatherRequest.json())
            sendData(ws, 'metars', WeatherRequest.json())
            break;
          case messageTypes.subscribe.AIRPORTS_AND_CATEGORIES:
            sendData(ws, 'airports-and-categories', WeatherRequest.airportsAndCategories());
            break;
          case messageTypes.subscribe.LOGS:
            logger.info("log message RX");
            sendLogData(ws);
            break;
        }
        break;
      case messageTypes.LEDS:
        switch(message.payload){
          case messageTypes.leds.ON:
            logger.info("ledState on");
            mapLightController.lightsOn();
            break;
          case messageTypes.leds.OFF:
            logger.info("ledState off");
            mapLightController.lightsOff();
            break;
          case messageTypes.leds.STATUS:
            console.log('Sending', mapLightController.getLightStatus());
            sendData(ws, 'light-status', mapLightController.getLightStatus(), false)
            break;
          default:
            logger.info("Unknown leds message: " + msg);
            break;
        }
        break;
      case messageTypes.DATA:
        switch(message.payload){
          case messageTypes.data.UPDATE:
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

// Sends log data to the ws client
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

// Send data to the websocket client.
// * ws           - the websocket
// * payloadName  - populates the 'type' field of the message
// * payload      - the data to be sent
// * repeat       - if the data should be sent repeatedly
// * sendInterval - how often to send the data
sendData = (ws, payloadName, payload, repeat=true, sendInterval=10) => {
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

    if(repeat) { setTimeout(sendData, sendInterval * 1000, ws, payloadName, payload, repeat) };
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

