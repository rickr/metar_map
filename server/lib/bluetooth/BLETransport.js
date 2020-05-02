// Takes a string and breaks it up into chunks to send
// over BLE. It's designed and intended to operate between
// a Bleno peripheral and a react-native-ble-plx central
class BLETransport {

  // Easily send small bits of data over BLE
  // NB If we get an object we send the string 'null'
  // and I hate this
  static send(data){
    let dataToSend = '';

    switch(typeof data){
      case 'boolean':
        dataToSend = data.toString();
        break;
      case 'object':
        console.log("Got typeof 'object', sending null");
        dataToSend = 'null';
        break;
      default:
        dataToSend = data
    }

    return Buffer.from(dataToSend);
  }

  constructor(data, updateValueCallback, chunkSize = 20){
    this.updateValueCallback = updateValueCallback;
    this.chunkSize = chunkSize; // bytes
    this.delay = 10 // ms between chunks

    this.data = this.setData(data + "\0");
  }

  setData(data){
    return this.splitString(data, this.chunkSize);
  }

  send(){
    if(!this.updateValueCallback){
      console.log('No callback provided, not sending data');
      return false
    }

    this.data.forEach((chunk, i) => {
      setTimeout(() => { this.sendChunk(chunk) }, i * this.delay);
    })
  }

  // private
  splitString(str, len) {
    let ret = [];
    for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
      ret.push(str.slice(offset, len + offset));
    }
    return ret;
  }

  sendChunk(chunk){
    console.log('Sending chunk: ' + chunk);
    this.updateValueCallback(new Buffer.from(chunk));
  }

}

module.exports = BLETransport
