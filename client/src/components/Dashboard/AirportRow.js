import React from 'react';
import '../../css/App.css';

export default class AirportRow extends React.Component {
  render() {
    return(
      <div className="tile is-ancestor">
        {this.props.children}
      </div>
    )
  }
}
