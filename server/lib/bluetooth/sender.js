// Takes a string and breaks it up into chunks to send
// over BLE
class Sender {
  constructor(data, updateValueCallback, chunkSize = 20){
    this.updateValueCallback = updateValueCallback;
    this.chunkSize = chunkSize; // bytes
    this.delay = 30 // ms between chunks

    this.data = this.setData(data + "\0");
    console.log(this.data);
  }

  setData(data){
    return this.splitString(data, this.chunkSize);
  }

  send(){
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

module.exports = Sender
