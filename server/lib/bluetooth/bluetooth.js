process.env['BLENO_DEVICE_NAME'] = 'WXMap';

const bleno = require('@abandonware/bleno');
const BlenoPrimaryService = bleno.PrimaryService;
const {EchoCharacteristic, ScanCharacteristic} = require('./characteristic');

console.log("Welcome!");
console.log("Address: 20:16:B9:20:7C:58");
console.log("State: " + bleno.state);

// new ScanCharacteristic().onReadRequest();


// For non root running:
// sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

bleno.on('disconnect', (clientAddress) => {
  console.log("Disconnected: " + clientAddress);
});

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('WXMap', ['ed6695dd-be8a-44d6-a11d-cb3348faa85a']);
  } else {
    bleno.stopAdvertising();
  }
});


bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'ed6695dd-be8a-44d6-a11d-cb3348faa85a',
        characteristics: [
          new EchoCharacteristic(),
          new ScanCharacteristic()
        ]
      })
    ],
    function(error) { console.log('setServices: '  + (error ? 'error ' + error : 'success')); }
    )
  }
});

