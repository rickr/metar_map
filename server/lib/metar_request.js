const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const convert = require('xml-js');
const request = require('request');
const querystring = require('querystring');

const config = require('./config');
const logger = require('./logger')('MetarRequest');

//
// These classes handle fetching and accessing the METAR and TAF weather data
// The data ends up on disk for us to transform/process
//

// Converting this to work on instances would probably be easier
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

  static fileName(){ return config.metar_file; }
  static requestName(){ return "METAR"; }
  static stationString(){ return("&stationString=" + config.airports.join(',')) }
  static updateRate() { return config.update_rate }

  static url(){
    return(
      'https://www.aviationweather.gov/adds/dataserver_current/httpparam?' +
      querystring.encode(this.params()) +
      this.stationString()
    );
  }

  static readDataFile(){
    if(!fs.existsSync(this.fileName())) { return false }
    let dataXML = fs.readFileSync(this.fileName()).toString();
    return(convert.xml2js(dataXML, { compact: true } ));
  }

  static json(){
    let data = {
      fetched:  null,
      airports: []
    };

    let dataJSON = this.readDataFile();
    if(dataJSON == false){ return {} }


    if(!dataJSON.response || dataJSON.response.data == null){
      logger.info("The data looks invalid - aborting (check '" + this.fileName() + "')");
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

  static call(){
    request(this.url(), (error, response, body) => {
      logger.info("Writing " + this.requestName() + " to " + this.fileName());
      fs.writeFile(this.fileName(), body, (err) => {
        if(err){ return(logger.info(err)) }
      })
    });
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

  static fileName(){ return(config.taf_file); }

  static requestName(){ return "TAF"; }

  static orderData(data, dataJSON){
    // Return our airports in the order they are in the config
    config.airports.forEach((airport, i) => {
      data.airports.push(dataJSON.response.data.TAF.find(data => data.station_id._text == airport));
    })
  }
}

// WeatherRequest wraps up all different types of weather requests (eg Metars, TAFs),
// fetches updates and places them into one object.
//
// Each request should implement the following functions for consistency:
//   * call()
//       - The kickoff point for the request
//   * requestName()
//       - Returns a string of the name of the request to help with logging and configuration
//   * Json()
//       - The data from the request as a javascript object (maybe this should be renamed to data()?)
class WeatherRequest{
  // FIXME have the request types passed in
  static call(){
    this.callEvery(MetarRequest);
    this.callEvery(TafRequest);
  }

  static update(){
    MetarRequest.call();
    TafRequest.call();
  }

  static callEvery(object){
    const currentTime = Math.floor(Date.now() / 1000);

    const requestName = object.requestName();
    const updateRate = object.updateRate();

    logger.info("   Updating " + requestName + " at " + currentTime);

    object.call()

    const updateIn = this.convertMinutesToMiliseconds(updateRate)
    logger.info("Next " + requestName +" update at " + (currentTime + updateIn) + " (" + updateRate + " mins)");
    setTimeout(() => { this.callEvery(object) }, updateIn);
  }

  // Convert config values given in minutes to ms needed for setTimeout calls
  static convertMinutesToMiliseconds(min) { return min * 60 * 1000 }

  static json(){
    let metars = MetarRequest.json();
    let tafs = TafRequest.json();

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

  static airportsAndCategories(){
    const data = MetarRequest.json()
    const airports = data.airports
    let output = []
    for(const airport in airports){
      if(!airports[airport]){ continue }
      let obj = {}
      let stationID = airports[airport].station_id._text
      let flightCategory = airports[airport].flight_category && airports[airport].flight_category._text

      output.push({name: stationID, flightCategory: flightCategory})
    }
    return output
  }

}

module.exports = { WeatherRequest, MetarRequest, TafRequest };
