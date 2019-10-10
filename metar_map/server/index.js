require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4567;
const fs = require('fs');
const https = require('https');
const request = require('request');
const querystring = require('querystring');
const yaml = require('js-yaml');
const convert = require('xml-js');

// Local libs
const config = require('./config')

const app = express();
const enableWs = require('express-ws')
enableWs(app)

/*
 *
 * Classes
 *
 */
class MetarRequest{
  static params = {
      dataSource: 'metars',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: '3',
      mostRecentForEachStation: 'true'
  };

  static fileName = "/tmp/metar";

  static stationString = () => {
    return("&stationString=" + config.airports.join(','))
  }

  static url(){
    return(
      'https://www.aviationweather.gov/adds/dataserver_current/httpparam?' +
      querystring.encode(this.params) +
      this.stationString()
    );
  }

  static as_json(){
    console.log("Reading data from " + this.fileName);
    let metar = {
      fetched:  null,
      airports: []
    };

    let metarXML = fs.readFileSync(this.fileName).toString();
    let metarJSON = convert.xml2js(metarXML, { compact: true } );

    // Return our airports in the order they are in the config
    config.airports.forEach((airport, i) => {
      metar.airports.push(metarJSON.response.data.METAR.find(metar => metar.station_id._text == airport));
    })

    return metar;
  }

  static execute(){
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("   Updating at " + currentTime);

    request(MetarRequest.url(), (error, response, body) => {
      console.log("Writing to " + MetarRequest.fileName);
      fs.writeFile(MetarRequest.fileName, body, (err) => {
        if(err){ return(console.log(err)) }
      })
    });

    let update_in = config.update_rate * 60 * 1000;
    console.log("Next update at " + (currentTime + update_in) + " (" + config.update_rate + " mins)");
    setTimeout(MetarRequest.execute, update_in);
  }
}

/*************************
 *
 * End Classes
 *
 *************************/

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('<h1>Welcome!!</h1>');
});

app.get('/metar.xml', (req, res) => {
  var stream = fs.createReadStream('/tmp/metar');
  res.set('Content-Type', 'text/xml');
  stream.pipe(res);
});

app.get('/metar', (req, res) => {
  var stream = fs.readFile('/tmp/metar', (err, contents) => {
    metar = convert.xml2js(contents.toString(), { compact: true });
    res.set('Content-Type', 'text/json');
    res.send(metar);
  });
});

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
  }
  setTimeout(sendMetarData, 10 * 1000, ws)
}

app.listen(port, () => console.log(`Metar Map listening on port ${port}!`))

// Begin fetching metars
MetarRequest.execute();

