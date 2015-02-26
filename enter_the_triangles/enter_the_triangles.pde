import toxi.color.*;
import toxi.color.theory.*;
import toxi.util.datatypes.*;
import toxi.util.events.*;
import themidibus.*;


Triangles triangles;
Colors colors;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;

BeatManager beatManager;
Sifon s;

int width = 1024;
int height = 768;

void setup() {
  size(800, 600, P2D);

  triangles = new Triangles();


  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  beatManager = new BeatManager();

  beatManager.start();

  beatManager.listeners.addListener(triangles);

  kontrol = new Controller();

  colors = new Colors(30*30);

  s = new Sifon(this, width, height, P3D);

}

void draw() {

  s.begin();
  triangles.draw(s.g);
  s.end();
  s.send();





  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(s.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);

  colors.update();

}

void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  //println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);

    if (number == BUTTON_TRACK_NEXT) {

      if (value == 127) {
        // println("beat");
        beatManager.setBeat();
      }
    }
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);
  try {
    // beat channel
    if (channel == 0) {

      if (pad == 0) {
        // println("beat");
        beatManager.beat();
      }

    }

    if (channel == 1) {
      kontrol.setControlValueFromNote("strokeWidth", pad);
    }

    if (channel == 2) {
      kontrol.setControlValueFromNote("strokeWidth", pad);
    }

  } catch (Exception e) {

  }



}
