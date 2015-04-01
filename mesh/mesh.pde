import org.processing.wiki.triangulate.*;
import toxi.color.*;
import toxi.color.theory.*;

import lazer.viz.*;

LazerController kontrol;
Colors colors;
LazerSyphon send;

int width = 560;
int height = 560;

Piscina piscina;


void setup() {
  size(800, 600, P2D);

  kontrol = new LazerController(this);

  setControls();

  send = new LazerSyphon(this, width, height, P3D);

  colors = new Colors(30*30);

  piscina = new Piscina();
  piscina.reset();

  kontrol.beatManager.register(piscina);

}



void mouseClicked() {
  piscina.reset();
}

void draw() {
  colors.update();

  send.begin();

  piscina.draw(send.g);

  send.end();
  send.send();

  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(send.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);


}

void setControls () {
  kontrol.setMapping("bgalpha", kontrol.SLIDER1);
  kontrol.setMapping("speed", kontrol.SLIDER4, 10);
  kontrol.setMapping("spread", kontrol.SLIDER5);
  kontrol.setMapping("maxSize", kontrol.SLIDER6);
  kontrol.setMapping("hue", kontrol.KNOB1, 110);
  kontrol.setMapping("sat", kontrol.KNOB2, 127);
  kontrol.setMapping("bri", kontrol.KNOB3, 65);
  kontrol.setMapping("setRandomBrightColors", kontrol.BUTTON_MARKER_SET);
  kontrol.setMapping("setVoidColors", kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors", kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("drawPoints", kontrol.BUTTON_R2, 0);
  kontrol.setMapping("fill", kontrol.BUTTON_S1, 0);
  kontrol.setMapping("stroke", kontrol.BUTTON_M1, 1);
  kontrol.setMapping("zMultiplier", kontrol.SLIDER3, 1);
  kontrol.setMapping("rotate", kontrol.BUTTON_S4);
  kontrol.setMapping("rotateX", kontrol.KNOB4);
  kontrol.setMapping("rotateY", kontrol.KNOB5);
  kontrol.setMapping("rotateZ", kontrol.KNOB6);
  kontrol.setMapping("lights", kontrol.BUTTON_R1,1);
  kontrol.setMapping("randomFill", kontrol.BUTTON_S2);
  kontrol.setMapping("randomStroke", kontrol.BUTTON_M2);
  kontrol.setMapping("nextFill", kontrol.BUTTON_S3);
  kontrol.setMapping("nextStroke", kontrol.BUTTON_M3, 1);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
  kontrol.setMapping("drawRandomTriangle", kontrol.BUTTON_FWD);
  kontrol.setMapping("strokeWidth", kontrol.SLIDER7, 1);


}





// void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

//   //println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

//   // kontrol.handleMidiEvent(channel, pad, velocity);
//   try {

//     if (channel == 0) {
//       piscina.beat();
//     }

//     if (channel == 1) {
//       kontrol.setControlValueFromNote("speed", pad);
//     }

//     if (channel == 2) {
//       kontrol.setControlValueFromNote("maxSize", pad);
//     }

//     if (channel == 3) {
//       kontrol.setControlValueFromNote("strokeWidth", pad);
//     }
//   } catch (Exception e) {

//   }



// }


