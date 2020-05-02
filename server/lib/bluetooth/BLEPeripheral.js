process.env['BLENO_DEVICE_NAME'] = 'WXMap';

const bleno = require('@abandonware/bleno');
const logger = require('../logger')('BLEPeripheral');

const mapService = require('./mapService')
const wifiService = require('./wifiService')

const WebSocket = require('ws');

const getPort = require('../getPort')
const port = getPort();

//
// This class is the entry point for our BLE 'server'
// BLE is composed of 'services', and within the services
// 'characteristics'. You can read, write, and be notfifed
// of characteristic values.
//

// For non root running:
// sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
class BLEPeripheral {
  constructor(){
    this.startAdvertising = false;
    this.services = [];
    this.ws = null;

    // Maybe we should just run this when someone connects
    // and kill it when someone disconnects
    this.initializeWebSocket();

    this.registerServices();
    this.registerHandlers();
  }

  call(){
    this.startAdvertising = true;
  }

  initializeWebSocket(){
    const wsAddress = 'ws://localhost:' + port + '/metar.ws';
    console.log('Connecting to:', wsAddress);
    this.ws = new WebSocket(wsAddress);

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({subscribe: 'airports-and-categories'}));
    }
    this.ws.onmessage = () => { console.log('on message') };
  }

  registerServices(){
    this.services.push(new wifiService);
    this.services.push(new mapService(this.ws));
  }

  serviceUUIDs(){
    return this.services.map((service) => { return service.uuid });
  }

  registerHandlers(){
    bleno.on('accept', this.acceptHandler.bind(this))
    bleno.on('disconnect', this.disconnectHandler.bind(this));
    bleno.on('stateChange', this.stateChangeHandler.bind(this));
    bleno.on('advertisingStart', this.advertisingStartHandler.bind(this));
  }


  // Handlers
  acceptHandler(clientAddress){
      logger.info("Connect: " + clientAddress);
      return true;
  }

  disconnectHandler(clientAddress){
    logger.info("Disconnected: " + clientAddress);
    return true;
  }

  stateChangeHandler(state){
    logger.info('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
      if(this.startAdvertising){
        bleno.startAdvertising('WXMap', [mapService.uuid()]);
      }
    } else {
      bleno.stopAdvertising();
    }
  };

  advertisingStartHandler(error){
    logger.info('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
    if (!error) {
      bleno.setServices(
        this.services,
        (error) => {
          logger.info('setServices: '  + (error ? 'error ' + error : 'success'));
          logger.info('Advertising ' + this.services.length + ' services');
          logger.info("Address: " + bleno.address);
        }
      )
    }
  };
}

module.exports = BLEPeripheral;
