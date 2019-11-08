import React from 'react';
import '../../css/App.css';

export default class MetarAge extends React.Component {
  metarAgeTime = () => {
    let diff = Math.floor((this.props.current_time - this.props.last_updated) / 1000);
    let min = Math.floor(diff / 60);
    let sec = Math.floor(diff % 60);
    return min + ":" + sec.toString().padStart(2, '0');
  }

  render(){
    return(
      <div className='tile is-ancenstor'>
        <div className='tile is-parent is-12 has-text-grey-lighter' style={{ marginTop: '0px', paddingTop: '0px' }} >
          <div className='tile is-child'>
            <div className='is-pulled-right'>{this.metarAgeTime()} old</div>
          </div>
        </div>
      </div>
    )
  }
}
