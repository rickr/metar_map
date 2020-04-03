const bleno = require('@abandonware/bleno');
const wifi = require('node-wifi');

wifi.init({ iface: null });

class ScanCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: 'ec0f',
      properties:  ['notify'],
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
        this.networks = this.splitString(JSON.stringify(networks), 20);
        console.log(this.networks);
        this.isScanning = false;
        console.log('Scan complete');
      }
    })
  }

  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, this.value);
  }

  onNotify(){
    console.log("onNotify");
  }


  splitString(str, len) {
    let ret = [];
    for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
      ret.push(str.slice(offset, len + offset));
    }
    return ret;
  }

  sendChunk(chunk){
    this.updateValueCallback(new Buffer.from(chunk));
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("On Subscribe");
    this.updateValueCallback = updateValueCallback
    this.wifiScan();
    const interval = setInterval(() => {
      if(this.isScanning){
        console.log("Still scanning")
      }else {
        this.networks.forEach((chunk) => {
          this.sendChunk(chunk);
        })
        this.sendChunk("\0");

        clearInterval(interval)
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

