// A class to handle RXd messages from our clients
//
// A message has the format of
// { type: TYPE, payload: PAYLOAD}
class Message{
  constructor(message){
    this.parsedMessage = JSON.parse(message)
    this.type = Object.keys(this.parsedMessage)[0]
    this.payload = Object.values(this.parsedMessage)[0]
  }
}

module.exports = Message
