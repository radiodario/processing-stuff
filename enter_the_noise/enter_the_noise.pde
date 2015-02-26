import toxi.color.*;
import toxi.color.theory.*;
import toxi.util.datatypes.*;
import toxi.util.events.*;
import themidibus.*;

MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Colors colors;
Sifon send;

int width = 1024;
int height = 768;

Noisefield noisefield;

void setup() {
  size(800, 600, P2D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  send = new Sifon(this, width, height, P3D);

  colors = new Colors(30*30);

  noisefield = new Noisefield(width);

}


void draw() {

  // float updateRate = map(kontrol.get("updateRate"), 0, 127, 0, 10);

  // if (frameCount % (updateRate +1) == 0) {
  noisefield.update();
  // }

  colors.update();

  send.begin();
  noisefield.draw(send.g);
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


void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);

    if (number == BUTTON_TRACK_NEXT) {

      if (value == 127) {
        println("beat");
        //beatManager.setBeat();
      }
    }
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  //println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);
  try {

    if (channel == 0) {
      // piscina.beat();
    }

    if (channel == 1) {
      kontrol.setControlValueFromNote("elevation", pad);
    }

    if (channel == 2) {
      // kontrol.setControlValueFromNote("maxSize", pad);
    }

    if (channel == 3) {
      // kontrol.setControlValueFromNote("strokeWidth", pad);
    }
  } catch (Exception e) {

  }



}

