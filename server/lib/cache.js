// Allows us to push data to an array but only keep
// retain a certain amount of data.
//
// Mostly used to cache log data to send to clients
class Cache{
  constructor(maxLength){
    this.values = [];
    this.maxLength = maxLength
  }

  store(data){
    if(this.values.length >= this.maxLength) {
      this.getLast();
    }
    return this.values.push(data);
  }

  getLast(){ return this.values.splice(0,1)[0]; }
}

module.exports = Cache
