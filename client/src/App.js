import React from 'react';
import './css/App.css';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import Tools from './components/Tools';
import WebSocketClient from './lib/WebSocketClient';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

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
            <li className={this.isActive('tools')}><Link onClick={() => this.makeActive('tools')} to="/tools">Tools</Link></li>
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
            <Route path="/tools">
              <Tools ws={this.state.ws}/>
            </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
