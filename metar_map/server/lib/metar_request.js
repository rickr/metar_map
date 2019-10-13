const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const convert = require('xml-js');
const config = require('./config');
const request = require('request');
const querystring = require('querystring');

class MetarRequest{
  static params(){
    return {
      dataSource: 'metars',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: '3',
      mostRecentForEachStation: 'true'
    }
  };

  static fileName(){ return("/tmp/metar") };

  static stationString(){
    return("&stationString=" + config.airports.join(','))
  }

  static url(){
    return(
      'https://www.aviationweather.gov/adds/dataserver_current/httpparam?' +
      querystring.encode(this.params()) +
      this.stationString()
    );
  }

  static as_json(){
    console.log("Getting JSON!");
    let metar = {
      fetched:  null,
      airports: []
    };

    let metarXML = fs.readFileSync(this.fileName()).toString();
    let metarJSON = convert.xml2js(metarXML, { compact: true } );

    // Return our airports in the order they are in the config
    config.airports.forEach((airport, i) => {
      // This breaks if we dont know the format - should warn us!
      if(metarJSON.response == null){
        console.log("The metar data looks invalid - aborting (check '" + this.fileName() + "')");
        return false;
      }
      metar.airports.push(metarJSON.response.data.METAR.find(metar => metar.station_id._text == airport));
    })

    return metar;
  }

  static execute(){
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("   Updating at " + currentTime);

    request(MetarRequest.url(), (error, response, body) => {
      console.log("Writing to " + MetarRequest.fileName());
      fs.writeFile(MetarRequest.fileName(), body, (err) => {
        if(err){ return(console.log(err)) }
      })
    });

    let update_in = config.update_rate * 60 * 1000;
    console.log("Next update at " + (currentTime + update_in) + " (" + config.update_rate + " mins)");
    setTimeout(MetarRequest.execute, update_in);
  }
}

module.exports = MetarRequest;
