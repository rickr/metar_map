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
const winston = require('winston');

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

this.logFile = '/var/log/metar_map.log'
const errorLogFile = '/var/log/metar_map.error.log'
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'server' },
  transports: [
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({ filename: errorLogFile, level: 'error' }),
    new winston.transports.File({ filename: this.logFile })
  ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

function Cache(maxLength) {
  this.values = [];

  this.store = function(data) {
    if(this.values.length >= maxLength) {
      this.getLast();
    }
    return this.values.push(data);
  }

  this.getLast = function() {
    return this.values.splice(0,1)[0];
  }
}

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
app.use(express.static(path.join(__dirname, '../client/build')));

sendLogData = (ws) => {
  let logLines = new Cache(100)
  console.log(this.logFile);

  logger.info("Sending log data");

  if(!ws){ logger.info("WS is null"); return false }
  if(ws.readyState === 1){
    const latestLines = spawn('tail', ['-100', this.logFile]);
    latestLines.stdout.on('data', (line) => { logLines.store(line.toString()) })

    logger.info(logLines.length);

    const tail = spawn('tail', ['-F', this.logFile]);
    tail.stdout.on('data', (line) => {
      logLines.store(line.toString());
      ws.send(JSON.stringify({
        type: "logs",
        payload: logLines
      }));
    })
  }
}

function sendMetarData(ws){
  logger.info("Sending metar data");
  if(!ws){ logger.info("WS is null"); return false }

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
    logger.info("Unknown ready state: " + ws.readyState);
  }
}


// Begin fetching metars
WeatherRequest.execute();
if(os.arch() == 'arm' ){ NeoPixel.execute() }

app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`))

