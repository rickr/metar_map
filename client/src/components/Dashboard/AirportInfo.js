import React from 'react';
import '../../css/App.css';

export default class AirportInfo extends React.Component {
  render(){
    let metar_text = null;
    let taf_text = [];
    if(this.props.selectedAirport){
      let airport_id = this.props.selectedAirport.station_id._text;

      metar_text = this.props.selectedAirport.raw_text._text;
      let taf = this.props.airports[airport_id].taf
      if(taf){
        taf_text = taf.raw_text._text.split(/(?=TEMPO|BECMG|FM|PROB)/)
      }
    }else{
      metar_text = ''
    }

    return(
      <div className='has-text-centered'>
        <pre>
          <p>{metar_text}</p>
          <p>{taf_text.join("\n")}</p>
        </pre>
      </div>
    )
  }
}
