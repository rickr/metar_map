const bleno = require('@abandonware/bleno');
const wifi = require('node-wifi');
const BLETransport = require('../BLETransport')

const Services = require('../services')


// Write to start a wifi scan
// Subscribe for results
class ScanCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: Services.wifiService.characteristics.scan,
      properties:  ['write', 'notify'],
      value: ''
    })

    this.isScanning = false;
    this.networks = [];
    this.updateValueCallback = null;
    wifi.init({iface: null});
  }

  wifiScan(){
    console.log("Starting scan")
    this.isScanning = true;
    wifi.scan((err, networks) => {
      if(err){
        console.log(err);
        this.isScanning = false;
      }else{
        this.networks = JSON.stringify(networks);
        this.isScanning = false;
        this.sendResults()
        console.log('Scan complete');
      }
    })
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request");
    if(data.toString('utf8') == '1'){
      console.log('Scanning')
      this.wifiScan();
    }
    else {
      console.log('disabled')
    };
    callback(this.RESULT_SUCCESS);
  }

  onNotify(){
    //console.log("onNotify");
  }

  sendResults(){
    const interval = setInterval(() => {
      if(!this.isScanning && this.networks.length > 0){
        console.log("Sending results");
        console.log(this.networks);
        new BLETransport(this.networks, this.updateValueCallback).send();
        clearInterval(interval)
      }
    }, 1000);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("On Subscribe");
    this.updateValueCallback = updateValueCallback
    this.sendResults()
  }
}

class EchoCharacteristic extends bleno.Characteristic{
  constructor(){
    super({
      uuid: 'ec0e',
      properties:  ['read', 'write', 'notify'],
      value: null
    })

    this._value = new Buffer.alloc(0);
    this._updateValueCallback = null;
  }

  onReadRequest(offset, callback){ 
    console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
    callback(this.RESULT_SUCCESS, this._value);
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    this._value = data;

    console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

    if (this._updateValueCallback) {
      console.log('EchoCharacteristic - onWriteRequest: notifying');

      this._updateValueCallback(this._value);
    }

    callback(this.RESULT_SUCCESS);
  };

}

module.exports = ScanCharacteristic

