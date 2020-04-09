process.env['BLENO_DEVICE_NAME'] = 'WXMap';

const bleno = require('@abandonware/bleno');
const BlenoPrimaryService = bleno.PrimaryService;
const {ScanCharacteristic} = require('./wifiService/scanCharacteristic');
const {ipCharacteristic} = require('./mapService/ipCharacteristic');

console.log("Welcome!");
console.log("Address: 20:16:B9:20:7C:58");
console.log("State: " + bleno.state);

// new ScanCharacteristic().onReadRequest();


// For non root running:
// sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

bleno.on('accept', (clientAddress) => {
  console.log("Connect: " + clientAddress);
  return true;
});

bleno.on('disconnect', (clientAddress) => {
  console.log("Disconnected: " + clientAddress);
  return true;
});

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('WXMap', ['ed6695dd-be8a-44d6-a11d-cb3348faa85a']);
  } else {
    bleno.stopAdvertising();
  }
});

wifiService = new BlenoPrimaryService({
  uuid: 'ed6695dd-be8a-44d6-a11d-cb3348faa85a',
  characteristics: [
    new ScanCharacteristic()
  ]
})

mapService = new BlenoPrimaryService({
  uuid: 'a5023bbe-29f9-4385-ab43-a9b3600ab7c4',
  characteristics: [
    new ipCharacteristic()
  ]
})

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
    bleno.setServices([
      wifiService,
      mapService
    ],
    function(error) { console.log('setServices: '  + (error ? 'error ' + error : 'success')); }
    )
  }
});

