import React from 'react';

class Tools extends React.Component {
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

  ledStateClassNames = () => { }

  render(){
    return(
      <div>
        <button className={this.ledStateCssClass()} onClick={this.setLedState}>Turn Lights {this.ledStateString()}</button>
      </div>
    );
  };
}

export default Tools;
