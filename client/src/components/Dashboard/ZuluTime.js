import React from 'react';
import '../../css/App.css';

export default class ZuluTime extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className='tile is-ancenstor'>
        <div className='tile is-parent is-12' style={{ marginTop: '0px', paddingTop: '0px' }} >
          <div className='tile is-child'>
            <div className='has-text-centered is-size-4'>{this.props.current_time.toUTCString()}</div>
          </div>
        </div>
      </div>
    )
  }

}
