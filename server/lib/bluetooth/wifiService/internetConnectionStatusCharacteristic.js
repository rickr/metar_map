const bleno = require('@abandonware/bleno');
const dns = require("dns");
const BLETransport = require('../BLETransport');

const Services = require('../services');


const TEST_ADDRESS = 'www.google.com';
const TEST_INTERVAL = ((5 * 1000) * 60) * 60; // 5 min

class InternetConnectionStatusCharacteristic extends bleno.Characteristic {
  constructor(){

    super({
      uuid: Services.wifiService.characteristics.internetConnection,
      properties:  ['read'],
    })

    this.checkResolveDNS();
    this.connectedToInternet = false;
  }

  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, BLETransport.send(this.connectedToInternet));
    //callback(this.RESULT_SUCCESS, BLETransport.send(false));
  }

  checkResolveDNS(){
    dns.resolve(TEST_ADDRESS, (err, addr) => {
      if (err) {
        this.connectedToInternet = false;
          console.log('Internet has been disconnected');
      } else {
        if (this.connectedToInternet) {
          //connection is still up and running, do nothing
        } else {
          this.connectedToInternet = true;
        }
      };
    })

    setInterval(() => { this.checkResolveDNS() }, TEST_INTERVAL);
  }
}

module.exports = InternetConnectionStatusCharacteristic
