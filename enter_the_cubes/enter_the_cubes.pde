
import toxi.color.*;
import toxi.color.theory.*;
import toxi.util.datatypes.*;
import toxi.util.events.*;
import themidibus.*;

Cubes cubes;
Colors colors;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
BeatManager beatManager;
Sifon s;
Boolean setupReady = false;

int width = 1024;
int height = 768;

void setup()  {
//  size(640, 480, P3D);
  size(800, 600, P2D);
// size(displayWidth, displayHeight, P3D);
//  noStroke();
  frameRate(60);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");
  beatManager = new BeatManager();

  beatManager.start();

  kontrol = new Controller();

  colors = new Colors(30*30);
  cubes = new Cubes(30, beatManager);

  s = new Sifon(this, width, height, P3D);

  setupReady = true;

}

void draw()  {

  s.begin();
  if (kontrol.get("ortho") == 0) {
    s.g.ortho(0, width, 0, height);
  } else {
    float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
    float cameraZ = (height/2.0) / tan(fov/2.0);
    s.g.perspective(fov, float(width)/float(height), cameraZ/2.0, cameraZ*2.0);
  }

  if (kontrol.get("lights") > 0) {
    s.g.lights();
  }


  cubes.draw(s.g);
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
  cubes.update();
}


void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);

    if (number == BUTTON_TRACK_NEXT) {

      if (value == 127) {
        println("beat");
        beatManager.setBeat();
      }
    }
  }

  if (bus_name == "vdmxKontrol") {

    // text("Handled " + channel + " " + number + " " + value, 50, 10);

  }

}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // if (setupReady) {
  //   // text(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name, 50, 100);
  // }

  // kontrol.handleMidiEvent(channel, pad, velocity);

  if (pad == 0) {
    beatManager.beat();
  }

  if (channel == 2) {
    kontrol.setControlValueFromNote("decay", pad);
  }



}


