const bleno = require('@abandonware/bleno');
const wifi = require('node-wifi');
const Sender = require('./sender')

wifi.init({ iface: null });

// Write to start a wifi scan
// Subscribe for results
class ScanCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: 'fe600987-e2ea-4c16-b938-f5d04e904af2',
      properties:  ['write', 'notify'],
      value: ''
    })

    this.isScanning = false;
    this.networks = [];
    this.updateValueCallback = null;
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
        console.log('Scan complete');
      }
    })
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request");
    console.log("Data:" + data.toString('utf8'));
    if(data.toString('utf8') == '1'){
      console.log('enabled') 
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

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("On Subscribe");
    const interval = setInterval(() => {
      if(!this.isScanning && this.networks.length > 0){
        console.log("Sending results");
        console.log(this.networks);
        new Sender(this.networks, updateValueCallback).send();
        clearInterval(interval)
      }else {
        console.log("Still scanning")
      }
    }, 1000);
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


// var EchoCharacteristic = function() {
//   EchoCharacteristic.super_.call(this, {
//     uuid: 'ec0e',
//     properties: ['read', 'write', 'notify'],
//     value: null
//   });
// 
//   this._value = new Buffer(0);
//   this._updateValueCallback = null;
// };

// util.inherits(EchoCharacteristic, BlenoCharacteristic);
// 
// EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
//   console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
// 
//   callback(this.RESULT_SUCCESS, this._value);
// };
// 
// EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
//   this._value = data;
// 
//   console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
// 
//   if (this._updateValueCallback) {
//     console.log('EchoCharacteristic - onWriteRequest: notifying');
// 
//     this._updateValueCallback(this._value);
//   }
// 
//   callback(this.RESULT_SUCCESS);
// };
// 
// EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
//   console.log('EchoCharacteristic - onSubscribe');
// 
//   this._updateValueCallback = updateValueCallback;
// };
// 
// EchoCharacteristic.prototype.onUnsubscribe = function() {
//   console.log('EchoCharacteristic - onUnsubscribe');
// 
//   this._updateValueCallback = null;
// };

module.exports = { EchoCharacteristic, ScanCharacteristic }

