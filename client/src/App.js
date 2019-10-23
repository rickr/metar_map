import React from 'react';
import './css/App.css';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

// WebSocketClient handles all aspects of our websocket and its data
// and updates the state of our app
class WebSocketClient {
  constructor(App){
    this.App = App
    this.messageTypes = ['metars', 'logs'];
    this.connect();
  };

  connect = () => {
    console.log("Opening WS to " + window.location.host);
    this.ws = new WebSocket('ws://' + window.location.host + '/metar.ws')
  }

  subscribe = () => {
    this.ws.onopen = () => {
      console.log('Connected');
      this.messageTypes.forEach((messageType) => { this.ws.send(messageType) });
    }

    this.ws.onmessage = (evt) => { this.handleMessage(JSON.parse(evt.data)) }
  }

  handleMessage = (message) => {
    switch(message.type){
      case "metars":
        console.log('RX METAR');
        this.App.setState({
          airports: message.payload,
          metars: message.payload.metars.airports,
          metarCount: message.payload.metars.airports.length,
          lastUpdated: message.payload.metars.lastUpdated
        });
        break;
      case "logs":
        console.log('RX LOG');
        this.App.setState({ logLines: message.payload, });
        break;
      default:
        console.log('Unknown message type: ' + message);
        break;
    }
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      ws: null,
      airports: [],
      metars: [],
      metarCount: null,
      lastUpdated: null,
      logLines: []
    };
  }

  componentDidMount = () => {
    let ws = new WebSocketClient(this);
    this.setState({
      ws: ws,
      activeTab: 'dashboard'
    })
    ws.subscribe();
  }

  isActive = (tabName) => { if(tabName === this.state.activeTab){ return 'is-active' } }

  makeActive = (tabName) => { this.setState({activeTab: tabName}); }

  render = () => {
    return(
      <Router>
        <div className="tabs">
          <ul>
            <li className={this.isActive('dashboard')}><Link onClick={() => this.makeActive('dashboard')} to="/">Dashboard</Link></li>
            <li className={this.isActive('logs')}><Link onClick={() => this.makeActive('logs')} to="/logs">Logs</Link></li>
          </ul>
        </div>
        <Switch>
            <Route exact path="/"
              render={(props) =>
                <Dashboard ws={this.state.ws}
                           airports={this.state.airports}
                           metars={this.state.metars}
                           metarCount={this.state.metarCount}
                           lastUpdated={this.state.lastUpdated}
                />
              }>
            </Route>
            <Route path="/logs">
              <Logs logLines={this.state.logLines}/>
            </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
