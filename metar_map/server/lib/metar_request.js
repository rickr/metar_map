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

  static fileName(){
    return config.metar_file;
  }

  static requestName(){
    return "METAR";
  }

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

  static readDataFile(){
    let dataXML = fs.readFileSync(this.fileName()).toString();
    return(convert.xml2js(dataXML, { compact: true } ));
  }

  static as_json(){
    let data = {
      fetched:  null,
      airports: []
    };

    let dataJSON = this.readDataFile();

    if(dataJSON.response.data == null){
      console.log("The data looks invalid - aborting (check '" + this.fileName() + "')");
      return { has_errors: true, errors: dataJSON.response.errors }
    }

    this.orderData(data, dataJSON);

    data.lastUpdated = fs.statSync(this.fileName()).mtime;
    return data;
  }

  static orderData(data, dataJSON){
    // Return our airports in the order they are in the config
    config.airports.forEach((airport, i) => {
      data.airports.push(dataJSON.response.data.METAR.find(data => data.station_id._text == airport));
    })
  }

  static execute(){
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("   Updating " + this.requestName() + " at " + currentTime);

    request(this.url(), (error, response, body) => {
      console.log("Writing " + this.requestName() + " to " + this.fileName());
      fs.writeFile(this.fileName(), body, (err) => {
        if(err){ return(console.log(err)) }
      })
    });

    let update_in = config.update_rate * 60 * 1000;
    console.log("Next " + this.requestName() +" update at " + (currentTime + update_in) + " (" + config.update_rate + " mins)");
    //setTimeout(this.execute, 5 * 1000);
  }
}

class TafRequest extends MetarRequest{
  static params(){
    return {
      dataSource: 'tafs',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: '3',
      mostRecentForEachStation: 'true'
    }
  };

  static fileName(){
    return(config.taf_file);
  }

  static requestName(){
    return "TAF";
  }

  static orderData(data, dataJSON){
    // Return our airports in the order they are in the config
    config.airports.forEach((airport, i) => {
      data.airports.push(dataJSON.response.data.TAF.find(data => data.station_id._text == airport));
    })
  }

}

class WeatherRequest{
  static execute(){
    MetarRequest.execute();
    TafRequest.execute();
  }

  static as_json(){
    let metars = MetarRequest.as_json();
    let tafs = TafRequest.as_json();
    let data = {}
    data.metars = metars;
    data.tafs = tafs;
    config.airports.forEach((airport, i) => {
      // This assumes everything is in the correct order...seems sketchy
      data[airport] = {};
      data[airport].metar = metars.airports[i]
      data[airport].taf = tafs.airports[i]
    })

    return data
  }
}

module.exports = { WeatherRequest, MetarRequest, TafRequest };
