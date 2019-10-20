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
    console.log("Opening WS");
    this.ws = new WebSocket('ws://localhost:4567/metar.ws')
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
      airports: null,
      metars: null,
      metarCount: null,
      lastUpdated: null
    };
  }

  componentDidMount = () => {
    let ws = new WebSocketClient(this);
    this.setState({ ws: ws })
    ws.subscribe();

  }

  render = () => {
    return(
      <Router>
        <div>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/logs">Logs</Link></li>
          </ul>
        </div>
        <Switch>
            <Route exact path="/" render={(props) => <Dashboard ws={this.state.ws} {...props} />}>
            </Route>
            <Route path="/logs">
              <Logs />
            </Route>
        </Switch>
      </Router>
    )
  }
}


export default App;
