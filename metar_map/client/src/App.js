import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

class Dashboard extends React.Component {
  ws = new WebSocket('ws://localhost:4567/metar.ws');

  airportsPerRow = 7;
  cycleDelay = 10 * 1000;
  firstMessage = true;

  constructor(props){
    super(props);
    this.state = {
      metars: [],
      metarCount: 0,
      selectedAirport: null,
      airportComponents: [],
      currentIndex: 0
    };
  };

  updateSelectedAirport = (metar) => { this.setState({ selectedAirport: metar }); };

  cycleAirports = () => {
    let nextIndex = this.state.currentIndex >= (this.state.metars.length - 1) ? 0 : this.state.currentIndex + 1
    this.setState({ currentIndex: nextIndex });

    this.updateSelectedAirport(this.state.metars[this.state.currentIndex]);

    setTimeout(this.cycleAirports, this.cycleDelay)
  }

  componentDidMount() {
    this.ws.onopen = () => {
      console.log('Connected')
    }

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if(data.type === 'metar'){
        console.log('RX metar message');
        this.setState({
          metars: data.payload.airports,
          metarCount: data.payload.airports.length,
        })

        if(this.firstMessage){
          this.firstMessage = false;
          this.setState({
            selectedAirport: data.payload.airports[0]
          })
        }
      } else {
        console.log('Unknown message: ' + JSON.stringify(data));
      }
    }

    this.cycleAirports();
  }

  render(){
    return(
      <div>
        <pre>{JSON.stringify(this.state.metars)}</pre>

        <AirportRows metars={this.state.metars} airportRows={this.state.metarCount / this.airportsPerRow} airportsPerRow={this.airportsPerRow} updateSelectedAirport={this.updateSelectedAirport}/>

        <AirportInfo selectedAirport={this.state.selectedAirport}/>
      </div>
    );
  };
}

class AirportRows extends React.Component{
  // Convert flight categories to a valid bulma css color class
  flightCategoryToCSS(flightCategory){
    if(flightCategory === "VFR"){
      return 'is-success';
    } else if(flightCategory === 'MVFR'){
      return 'is-info';
    } else if(flightCategory === 'IFR'){
      return 'is-danger';
    } else {
      return 'unknown-' + flightCategory;
    }
  };


  render(){
    let items = [];
    for(let i = 0; i < this.props.metars.length; i++){
      let metar = this.props.metars[i];
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
    }

    let rows = [];
    for(let i = 0; i < this.props.airportRows; i++){
      let start = i * this.props.airportsPerRow;
      let end = start + this.props.airportsPerRow
      rows.push(items.slice(start, end));
    }
    return(rows.map((row, i) => { return(<AirportRow key={i}>{row}</AirportRow>) }))
  }
}

class AirportRow extends React.Component {
  render() {
    return(
      <div className="tile is-ancestor">
        {this.props.children}
      </div>
    )
  }
}

class Airport extends React.Component {
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

class AirportWarning extends React.Component {
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

class AirportInfo extends React.Component {
  render(){
    let metar_text = null;
    if(this.props.selectedAirport){
      metar_text = this.props.selectedAirport.raw_text._text;
    }else{
      metar_text = ''
    }

    return(
      <pre>
        {metar_text}
      </pre>
    )
  }
}

export default App;
