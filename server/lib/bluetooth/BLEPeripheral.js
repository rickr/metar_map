process.env['BLENO_DEVICE_NAME'] = 'WXMap';

const bleno = require('@abandonware/bleno');
const logger = require('../logger')('BLEPeripheral');

const mapService = require('./mapService')
const wifiService = require('./wifiService')

// For non root running:
// sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
class BLEPeripheral {
  constructor(){
    this.startAdvertising = false;
    this.services = []

    this.registerServices();
    this.registerHandlers();

    logger.info("State: " + bleno.state);
  }

  call(){
    this.startAdvertising = true;
  }

  registerServices(){
    this.services.push(new wifiService);
    this.services.push(new mapService);
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
          logger.info('Advertising ' + this.services.length + ' servies');
          logger.info("Address: " + bleno.address);
        }
      )
    }
  };
}

module.exports = BLEPeripheral;
