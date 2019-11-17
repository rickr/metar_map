// WebSocketClient handles all aspects of our websocket and its data
// and updates the state of our app
export default class WebSocketClient {
  constructor(App){
    this.reconnectTimeout = 2;

    this.App = App
    this.messageTypes = ['metars', 'logs'];
    this.connectAndSubscribe();
  };

  connectAndSubscribe = () => {
    this.connect();
    this.registerCallbacks();
    this.subscribe();
  }

  connect = () => {
    console.log("Opening WS to " + window.location.host);
    this.ws = new WebSocket('ws://' + window.location.host + '/metar.ws')
  }

  subscribe = () => {
    this.ws.onopen = () => { this.messageTypes.forEach((messageType) => { this.send({subscribe: messageType}) }); }

  }

  registerCallbacks = () => {
    this.ws.onmessage = (evt) => { this.handleMessage(JSON.parse(evt.data)) }
    this.ws.onerror = (evt) => { console.log("An error occured: "); console.log(evt) }
    this.ws.onclose = (evt) => { console.log("Connection closed"); this.attemptReconnect(); }
  }

  attemptReconnect = () => {
    console.log("Reconnecting in ", this.reconnectTimeout, " sec");
    setTimeout(() => {
      this.connectAndSubscribe();
    }, this.reconnectTimeout * 1000)
  }

  send = (message) => { this.ws.send(JSON.stringify(message)) }

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
        console.log('Unknown message type: ' + JSON.stringify(message));
        break;
    }
  }
}
