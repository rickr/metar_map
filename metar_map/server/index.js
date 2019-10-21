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

app.use(bodyParser.json());
app.use(cors());

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
        console.log("metars RX");
        sendMetarData(ws);
        break;
      case "hello":
        console.log("hello RX");
        break;
      case "logs":
        console.log("log message RX");
        sendLogData(ws);
        break;
      default:
        console.log("RX unknown message '" + message + "'");
        break;
    }
  })
})

// Serve our production build
app.use(express.static(path.join(__dirname, '../client/build')));

function sendLogData(ws){
  const logFile = '/var/log/syslog';
  let logLines = new Cache(100)

  console.log("Sending log data");

  if(!ws){ console.log("WS is null"); return false }
  if(ws.readyState === 1){
    const latestLines = spawn('tail', ['-100', logFile]);
    latestLines.stdout.on('data', (line) => { logLines.store(line.toString()) })

    console.log(logLines.length);

    const tail = spawn('tail', ['-F', logFile]);
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
  console.log("Sending metar data");
  if(!ws){ console.log("WS is null"); return false }

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

    setTimeout(sendMetarData, 10 * 1000, ws)
  }else{
    console.log("Unknown ready state: " + ws.readyState);
  }
}


// Begin fetching metars
WeatherRequest.execute();
if(os.arch() == 'arm' ){ NeoPixel.execute() }

app.listen(port, () => console.log(`Metar Map listening on port ${port}!`))

