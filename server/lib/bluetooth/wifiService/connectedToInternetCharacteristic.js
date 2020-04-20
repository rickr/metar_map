const bleno = require('@abandonware/bleno');
const dns = require("dns");
const BLETransport = require('../BLETransport');


const TEST_ADDRESS = 'www.google.com'
const TEST_INTERVAL = ((5 * 1000) * 60) * 60 // 5 min

class ConnectedToInternetCharacteristic extends bleno.Characteristic {
  constructor(){

    super({
      uuid: '544eb8bb-c6ba-4e94-b2e9-581855102634',
      properties:  ['read'],
    })

    this.checkResolveDNS();
    this.connectedToInternet = false;
  }

  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, BLETransport.send(this.connectedToInternet));
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
          console.log('Internet is connected');
          this.connectedToInternet = true;
        }
      };
    })

    setInterval(() => { this.checkResolveDNS() }, TEST_INTERVAL);
  }
}

module.exports = ConnectedToInternetCharacteristic
