const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport');
const wifi = require('node-wifi');
const disconnectWifi = require('node-wifi');

const Services = require('../services')

class ConnectionCharacteristic extends bleno.Characteristic {
  constructor(){

    super({
      uuid: Services.wifiService.characteristics.connection,
      properties:  ['read', 'write'],
    })

    this.ssid = null;
    this.callback = null;

    // Hack
    // Scan doesnt work with an iface, and disconnect
    // doesn't work without it...
    wifi.init()
    disconnectWifi.init({ iface: 'wlan0' });

  }

  disconnect(){
    console.log("Disconnect")

    // This disconnects but fails to find the same SSID
    // after disconnection...disabling for now

    // disconnectWifi.disconnect((error) => {
    //   if(error){
    //     console.log("Error: " + error);
    //     this.callback(this.RESULT_SUCCESS);
    //     return false;
    //   }

    //   console.log('Disconnected!')
    //   this.callback(this.RESULT_SUCCESS);
    // })

    this.callback(this.RESULT_SUCCESS);
  }

  connect(data){
    console.log("Connect with")
    console.log(this.value)

    wifi.connect(this.value, (error) => {
      if(error){
        console.log("Error: " + error);
        this.callback(this.RESULT_SUCCESS);
        return false;
      }

      console.log("Conencted!");
      this.callback(this.RESULT_SUCCESS);
    })
  }

  // Shows what network we're connected to. If not connected return null
  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, BLETransport.send(this.ssid));
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    this.value = JSON.parse(data.toString('utf8'));
    console.log('Connection - onWriteRequest: value = ');
    console.log(this.value);

    this.callback = callback;

    switch(this.value.operation){
      case "connect":
        this.connect();
        return;
      case "disconnect":
        this.disconnect()
        return;
      default:
        console.log("Unknown operation: " + this.value.operation)
        callback(this.RESULT_SUCCESS);
    }



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
