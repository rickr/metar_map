process.env['BLENO_DEVICE_NAME'] = 'WXMap';

const bleno = require('@abandonware/bleno');
const BlenoPrimaryService = bleno.PrimaryService;
const logger = require('../logger')('BLEPeripheral');


const {ScanCharacteristic} = require('./wifiService/scanCharacteristic');
const {ipCharacteristic} = require('./mapService/ipCharacteristic');

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
    this.services.push(new BlenoPrimaryService({
      uuid: 'ed6695dd-be8a-44d6-a11d-cb3348faa85a',
      characteristics: [
        new ScanCharacteristic()
      ]
    }))

    this.services.push(new BlenoPrimaryService({
      uuid: 'a5023bbe-29f9-4385-ab43-a9b3600ab7c4',
      characteristics: [
        new ipCharacteristic()
      ]
    }))

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
        bleno.startAdvertising('WXMap', ['ed6695dd-be8a-44d6-a11d-cb3348faa85a']);
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
