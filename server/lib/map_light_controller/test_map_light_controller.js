import MapLightController from '../map_light_controller.js' 


    console.log("TYPE");
    console.log(MapLightController);
//class TestMapLightController extends MapLightController{
class TestMapLightController{
  constructor(){
    //super();
    // Board and strip setup
  }

  sendToLEDs(){
    console.log('strip.show()');
    //strip.show();
  }

  setColor(i, ledColor){
    console.log('Updating index ' + i + ' to color ' + ledColor);
    //strip.pixel(i).color(ledColor);
  }

}

module.exports = TestMapLightController;
