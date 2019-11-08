import React from 'react';
import '../css/App.css';
import ZuluTime from './Dashboard/ZuluTime';
import AirportRows from './Dashboard/AirportRows';
import MetarAge from './Dashboard/MetarAge';
import AirportInfo from './Dashboard/AirportInfo';

export default class Dashboard extends React.Component {
  airportsPerRow = 7;
  cycleDelay = 10 * 1000;
  afterClickCycleDelay = 20 * 1000;

  constructor(props){
    super(props);
    this.state = {
      selectedAirport: null,
      airportComponents: [],
      currentIndex: 0,
      airportCycleTimer: null,
      currentTime: new Date()
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
    setInterval(() => { this.setState({ currentTime : new Date() }) }, 1000)
    this.cycleAirports();
  }

  // FIXME cancel currentTimes timers when unmounting
  componentWillUnmount = () => {
  }

  render(){
    return(
      <div>
        <ZuluTime current_time={this.state.currentTime} />
        <AirportRows metars={this.props.metars} airportRows={this.props.metarCount / this.airportsPerRow} airportsPerRow={this.airportsPerRow} updateSelectedAirport={this.updateSelectedAirport}/>
        <MetarAge current_time={this.state.currentTime} last_updated={new Date(this.props.lastUpdated)} />

        <AirportInfo selectedAirport={this.state.selectedAirport} airports={this.props.airports}/>
      </div>
    );
  };
}
