import React from 'react';

export default class Tools extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      ledState: true
    }
  }

  setLedState = () => {
    this.props.ws.send({ leds: !this.state.ledState });
    this.setState({ ledState: !this.state.ledState });
  }

  ledStateString = () => { return (this.state.ledState === true ? 'Off' : 'On'); }

  ledStateCssClass = () => {
    let className = 'button is-large '
    className += this.state.ledState === false ? 'is-success' : 'is-danger';
    return className
  }

  updateData = () => {
    this.props.ws.send({ data: 'update' });
  }


  render(){
    return(
      <div>
        <p><button className={this.ledStateCssClass()} onClick={this.setLedState}>Turn Lights {this.ledStateString()}</button></p>
        <p><button className='button is-large is-primary' onClick={this.updateData}>Update Data</button></p>
      </div>
    );
  };
}
