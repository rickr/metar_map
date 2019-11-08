import React from 'react';
import '../../css/App.css';
import AirportRow from './AirportRow';
import Airport from './Airport';

export default class AirportRows extends React.Component{
  // Convert flight categories to a valid bulma css color class
  flightCategoryToCSS(flightCategory){
    if(flightCategory === "VFR"){
      return 'is-success';
    } else if(flightCategory === 'MVFR'){
      return 'is-info';
    } else if(flightCategory === 'IFR'){
      return 'is-danger';
    } else if(flightCategory === 'LIFR'){
      return 'is-lifr';
    } else {
      return 'unknown-' + flightCategory;
    }
  };

  render(){
    let items = [];
    if(this.props.metars.length === 0){ return false }
    this.props.metars.forEach((metar, _i) => {
      if(!metar){ return }
      let airport = Object.values(metar.station_id);
      let flightCategoryCSS = metar.flight_category ? this.flightCategoryToCSS(metar.flight_category._text) : 'unknown-category';
      let rawText = Object.values(metar.raw_text);

      let item = <Airport
                    key={airport}
                    id={airport}
                    flight_category={flightCategoryCSS}
                    raw_text={rawText}
                    updateSelectedAirport={this.props.updateSelectedAirport}
                    metar={metar}
                 />

      items.push(item)
    });

    let rows = [];
    for(let i = 0; i < this.props.airportRows; i++){
      let start = i * this.props.airportsPerRow;
      let end = start + this.props.airportsPerRow
      rows.push(items.slice(start, end));
    }
    return(rows.map((row, i) => { return(<AirportRow key={i}>{row}</AirportRow>) }))
  }
}
