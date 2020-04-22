const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport');

class ConnectionCharacteristic extends bleno.Characteristic {
  constructor(){

    super({
      uuid: 'b4a7d251-7467-440c-9bf8-570f1fbc929f',
      properties:  ['read', 'write'],
    })

    this.ssid = null;
  }

  // Shows what network we're connected to. If not connected return null
  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, BLETransport.send(this.ssid));
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    this._value = data;

    console.log('Connection - onWriteRequest: value = ' + this._value.toString('utf8'));

//     if (this._updateValueCallback) {
//       console.log('EchoCharacteristic - onWriteRequest: notifying');
//
//       this._updateValueCallback(this._value);
//     }
//
    callback(this.RESULT_SUCCESS);
  };

  // On write we connect to the ssid/password provided
  // onReadRequest(offset, callback){
  //   callback(this.RESULT_SUCCESS, Buffer.from(this.connectedToInternet.toString()));
  // }
}

module.exports = ConnectionCharacteristic
