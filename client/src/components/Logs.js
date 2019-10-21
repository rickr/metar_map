import React from 'react';

class Logs extends React.Component {
  componentDidMount = () => {
    console.log("Fetching logs");
  }

  render(){
    return(
      <div>
        <pre>{this.props.logLines.values}</pre>
      </div>
    );
  };
}

export default Logs;
