import React from 'react';
import '../../css/App.css';

export default class AirportWarning extends React.Component {
  render(){
    let warning = [];
    let key = Date.now();
    // We can probably be smarter about displaying warnings
    // Icing, better represent wind, what else?
    if(this.props.metar.wind_speed_kt && this.props.metar.wind_speed_kt._text > 20){ warning.push(<i key={key} className="fas fa-exclamation-triangle"></i>) }
    if(this.props.metar.wind_gust_kt && this.props.metar.wind_gust_kt._text > 20){ warning.push(<i key={key + 1} className="fas fa-exclamation-triangle"></i>) }
    if(this.props.metar.wind_gust_kt && this.props.metar.wind_gust_kt._text > 30){ warning.push(<i key={key + 2} className="fas fa-exclamation-triangle"></i>) }

    return(
      <p id={this.props.metar.station_id} className="icon is-small has-text-warning">
        { warning }
      </p>
    )
  }
}
