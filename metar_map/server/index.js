require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4567;
const https = require('https');
const convert = require('xml-js');

// Local libs
const config = require('./lib/config')
const MetarRequest = require('./lib/metar_request')

const app = express();
const enableWs = require('express-ws')
enableWs(app)

app.use(bodyParser.json());
app.use(cors());

// Serve our production build
app.use(express.static(path.join(__dirname, '../client/build')));

app.ws('/metar.ws', (ws, req) => {
  sendMetarData(ws);

  ws.on('message', (message) => { console.log("Client connected"); })
})

function sendMetarData(ws){
  if(ws.readyState === 1){
    ws.send(JSON.stringify(
      { type: 'metar',
        payload: MetarRequest.as_json()
      }
    ));
  }else{
    console.log("Unknown ready state: " + ws.readyState);
  }

  setTimeout(sendMetarData, 10 * 1000, ws)
}

app.listen(port, () => console.log(`Metar Map listening on port ${port}!`))

// Begin fetching metars
MetarRequest.execute();

