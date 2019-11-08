import React from 'react';
import '../../css/App.css';
import AirportWarning from './AirportWarning';

// FIXME the box should cursor: pointer
export default class Airport extends React.Component {
  sendAirportData = () => {
    this.props.updateSelectedAirport(this.props.metar);
  }

  render() {
    return(
      <div className="tile is-parent has-text-centered" onClick={this.sendAirportData}>
        <article className={ `tile is-child box notification ${this.props.flight_category}` } style={{padding: '0 5px 5px 0'}}>
          <p className="title is-4 has-text-centered" style={{marginBottom: '5px'}}> {this.props.id} </p>
          <AirportWarning metar={this.props.metar}/>
        </article>
      </div>
    );
  }
}

