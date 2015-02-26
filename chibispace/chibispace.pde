import pbox2d.*;
import themidibus.*;
import toxi.util.events.*;

import org.jbox2d.collision.shapes.*;
import org.jbox2d.common.*;
import org.jbox2d.dynamics.*;
import org.jbox2d.dynamics.joints.*;

PBox2D box2d;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;

Sifon s;

BeatManager beatManager;

Chibis chibis;

PImage skybox;
PImage buildings;
PImage horizon;
PImage eindbaas;
int height = 768;
int width = 1024;
// xpositions for parallax of
// sky, horizon and buildings;
double xPos0 = 0;
double xPos = 0;
double xPos2 = 0;
int whichFrame = 0;

void setup() {
  size(800, 600, P2D);
  frameRate(60);
  
  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "nanoKontrol");
  s = new Sifon(this, width, height, P3D);
  beatManager = new BeatManager();
  
  beatManager.start();
  
  kontrol = new Controller();
  
  // load the images
  skybox = loadImage("skybox.png");
  buildings = loadImage("buildings.png");
  horizon = loadImage("horizon.png");
  eindbaas = loadImage("eindbaas.png");
  
  box2d = new PBox2D(this);
  box2d.createWorld();
  box2d.setGravity(0, 0);
  
  chibis = new Chibis();  
  
}

void draw() {
  
  s.begin();
  
  float speed = kontrol.get("scrollSpeed");
  
  if (kontrol.get("drawSkyBox") > 0) {
    xPos0 -= speed * 0.1;
    if (xPos0 < -skybox.width) {
      xPos0 = 0;
    }
    
    s.g.image(skybox, (int) xPos0, 0);
    s.g.image(skybox, (int) xPos0 + skybox.width, 0);
  }
  
  s.g.fill(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"), map(kontrol.get("decay"), 0, 127, 0, 255));
  s.g.rect(0, 0, width, height);
  
  if (kontrol.get("drawBuildings") > 0) {
    
    // let's create a parallax effect
    int yPos = -(horizon.height - height);
    
    xPos -= speed * 0.8;
    xPos2 -= speed * 1.1;
    if (xPos < -horizon.width) {
      xPos = 0;
    }
    if (xPos2 < -buildings.width) {
      xPos2 = 0;
    }
    
    
    
    
    
    s.g.image(horizon, (int) xPos, yPos);
    
    s.g.image(horizon, (int)xPos+horizon.width, yPos);
    
    s.g.image(buildings,(int) xPos2, yPos);
    s.g.image(buildings, (int)xPos2+buildings.width, yPos);
  }
  
  if (kontrol.get("drawChibis") > 0 ) {
    chibis.update();
    box2d.step();
    chibis.draw(s.g);
  }
  
  if (kontrol.get("drawLogo") > 1) {
    s.g.image(eindbaas, width/2 - eindbaas.width/2, height/2 - eindbaas.height/2);
  }
  
  s.end();
  s.send();
  
  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(s.g, 200, 100, width/2, height/2);
  }
  text("running", 10, 10);
  kontrol.printMappings();

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

    // println("Handled " + channel + " " + number + " " + value);

  }
  
}


void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);

  if (pad == 0) {
    beatManager.beat();  
  }
  

}

