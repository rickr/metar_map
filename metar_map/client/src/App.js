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

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = { ws: null };
  }

  componentDidMount = () => {
    console.log("Opening WS");
    this.setState({ ws: new WebSocket('ws://localhost:4567/metar.ws') });
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
