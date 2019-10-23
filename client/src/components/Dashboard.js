import React from 'react';
import '../css/App.css';

class Dashboard extends React.Component {
  airportsPerRow = 7;
  cycleDelay = 10 * 1000;
  afterClickCycleDelay = 20 * 1000;

  constructor(props){
    super(props);
    this.state = {
      selectedAirport: null,
      airportComponents: [],
      currentIndex: 0,
      airportCycleTimer: null
    };
  };

  // When an airport is clicked display the information for that airport
  updateSelectedAirport = (metar) => {
    clearTimeout(this.state.airportCycleTimer);
    let airportCycleTimer = setTimeout(this.cycleAirports, this.afterClickCycleDelay)
    this.setState({
      airportCycleTimer: airportCycleTimer,
      selectedAirport: metar
    })
  };

  // FIXME this should show the first airport immediately
  cycleAirports = () => {
    if(!this.state.selectedAirport){
      if(!this.props.metars){
        // If we dont have any airports loaded keep checking
        // at a short interval until we do
        setTimeout(this.cycleAirports, 100);
        return false
      }
    }

    let nextIndex = this.state.currentIndex >= (this.props.metars.length - 1) ? 0 : this.state.currentIndex + 1
    this.setState({ currentIndex: nextIndex });

    let airportCycleTimer = setTimeout(this.cycleAirports, this.cycleDelay)
    this.setState({
      airportCycleTimer: airportCycleTimer,
      selectedAirport: this.props.metars[this.state.currentIndex]
    })
  }

  componentDidMount() {
    this.cycleAirports();
  }

  // FIXME cancel currentTimes timers when unmounting
  componentWillUnmount = () => {
  }

  render(){
    return(
      <div>
        <AirportRows metars={this.props.metars} airportRows={this.props.metarCount / this.airportsPerRow} airportsPerRow={this.airportsPerRow} updateSelectedAirport={this.updateSelectedAirport}/>
        <CurrentTimes last_updated={new Date(this.props.lastUpdated)} />

        <AirportInfo selectedAirport={this.state.selectedAirport} airports={this.props.airports}/>
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
    } else if(flightCategory === 'LIFR'){
      return 'is-lifr';
    } else {
      return 'unknown-' + flightCategory;
    }
  };

  render(){
    let items = [];
    if(this.props.metars.length === 0){ return false }
    this.props.metars.forEach((metar, _i) => {
      if(!metar){ return }
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
    });

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

class CurrentTimes extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentTime: new Date().toLocaleString(),
    }
  }

  componentDidMount() {
    setInterval(() => { this.setState({ currentTime : new Date() }) },1000)
  }

  metarAgeTime = () => {
    let diff = Math.floor((this.state.currentTime - this.props.last_updated) / 1000);
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

export default Dashboard;
