import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import themidibus.*; 
import codeanticode.syphon.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class chipsters_logos extends PApplet {



PImage fourdboy;
PImage chud_wt;
PImage ltc_bk;
PImage ltc_wt;
PImage ralp_bk;
PImage sbsm_1;
PImage sbsm_2;
PImage sbsm_3;
PImage sbsm_4;
PImage sultan_bk;
PImage sultan_wt;


PImage current;

Sifon s;
Controller kontrol;
MidiBus nanoKontrol;
MidiBus vdmxKontrol;

int width = 1024;
int height = 768;


public void setup() {
  size(800, 600, P2D);

  fourdboy = loadImage("fourdboy.png");
  chud_wt = loadImage("chud_wt.png");
  ltc_bk = loadImage("ltc_bk.png");
  ltc_wt = loadImage("ltc_wt.png");
  ralp_bk = loadImage("ralp_bk.png");
  sbsm_1 = loadImage("sbsm1.jpg");
  sbsm_2 = loadImage("sbsm2.jpg");
  sbsm_3 = loadImage("sbsm3.jpg");
  sbsm_4 = loadImage("sbsm4.jpg");
  sultan_bk = loadImage("sultan_bk.png");
  sultan_wt = loadImage("sultan_wt.png");


  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");


  kontrol = new Controller();


  s = new Sifon(this, width, height, P2D);

}


public void setImage() {
  if (kontrol.get("fourdboy") > 0) {
    current = fourdboy;
  }

  if (kontrol.get("chud") > 0) {
    current = chud_wt;
  }

  if (kontrol.get("ltc_bk") > 0) {
    current = ltc_bk;
  }

  if (kontrol.get("ltc_wt") > 0) {
    current = ltc_wt;
  }

  if (kontrol.get("ralp_bk") > 0) {
    current = ralp_bk;
  }

  if (kontrol.get("sbsm1") > 0) {
    current = sbsm_1;
  }

  if (kontrol.get("sbsm2") > 0) {
    current = sbsm_2;
  }

  if (kontrol.get("sbsm3") > 0) {
    current = sbsm_3;
  }

  if (kontrol.get("sbsm4") > 0) {
    current = sbsm_4;
  }

  if (kontrol.get("sultan_bk") > 0) {
    current = sultan_bk;
  }

  if (kontrol.get("sultan_wt") > 0) {
    current = sultan_wt;
  }
}


public void draw() {


  s.begin();

  s.g.imageMode(CENTER);

  // if (kontrol.get("safeLock") == 0) {
    setImage();
  // }

  s.g.image(current, width/2, height/2);


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


}


public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  try {
    if (bus_name == "nanoKontrol") {
      kontrol.handleMidiEvent(channel, number, value);

    }

    if (bus_name == "vdmxKontrol") {

    }

  } catch (Exception e) {

  }

}


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {



}


class Controller {


 int[] midiState;

 HashMap<String,Integer> mappings;


 public Controller() {
   midiState = new int[128];
   mappings = new HashMap<String, Integer>();
   setMappings();
 }


 public int get(String mapping) {

   try {
//     println(mapping + ": " + midiState[mappings.get(mapping)]);
     return midiState[mappings.get(mapping)];
   }
   catch (Exception e) {
     println(mapping + ": -1");
     return -1;
   }

 }


 public void handleMidiEvent(int channel, int number, int val) {
   println("Handled " + channel + " " + number + " " + val);
   if (number >= 0) {
     midiState[number] = val;
   }

 }




 public void setMapping(String name, int control) {
   mappings.put(name, control);
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }

 public void setMappings() {

    setMapping("safeLock", BUTTON_REC);


    setMapping("fourdboy", BUTTON_S5, 1);
    setMapping("chud", BUTTON_S6);
    setMapping("ltc_bk", BUTTON_S7);
    setMapping("ltc_wt", BUTTON_S8);

    setMapping("sbsm1", BUTTON_M5);
    setMapping("sbsm2", BUTTON_M6);
    setMapping("sbsm3", BUTTON_M7);
    setMapping("sbsm4", BUTTON_M8);

    setMapping("ralp_bk", BUTTON_R6);
    setMapping("sultan_bk", BUTTON_R7);
    setMapping("sultan_wt", BUTTON_R8);

    setMapping("hideFrame", BUTTON_R5, 1);

 }


  public void printMappings() {
   int i = 1;
   pushMatrix();
   pushStyle();
   translate(0, 0, 1);
   fill(0, 0, 0, 80);
   strokeWeight(1);
   stroke(0, 0, 0);
   rect(0, 0, 200, height);

   text("Mappings", 10, 10);
   for (String key : mappings.keySet()) {

      drawMapping(key, ++i);


   }

   popStyle();
   popMatrix();


 }

 public void drawMapping(String key, int i) {

   int x = 10;
   int y = 20 + (i * 20);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 15);
   fill(255, 0, 255);
   text(key + " = " + this.get(key), x, y);
 }


}
static int SLIDER1 = 0;
static int SLIDER2 = 1;
static int  SLIDER3 = 2;
static int  SLIDER4 = 3;
static int  SLIDER5 = 4;
static int  SLIDER6 = 5;
static int  SLIDER7 = 6;
static int  SLIDER8 = 7;
static int  KNOB1 = 16;
static int  KNOB2 = 17;
static int  KNOB3 = 18;
static int  KNOB4 = 19;
static int  KNOB5 = 20;
static int  KNOB6 = 21;
static int  KNOB7 = 22;
static int  KNOB8 = 23;
static int BUTTON_RWD = 43;
static int BUTTON_FWD = 44;
static int BUTTON_PLAY = 41;
static int BUTTON_STOP = 42;
static int BUTTON_REC = 45;
static int BUTTON_S1 = 32;
static int BUTTON_S2 = 33;
static int BUTTON_S3 = 34;
static int BUTTON_S4 = 35;
static int BUTTON_S5 = 36;
static int BUTTON_S6 = 37;
static int BUTTON_S7 = 38;
static int BUTTON_S8 = 39;
static int BUTTON_M1 = 48;
static int BUTTON_M2 = 49;
static int BUTTON_M3 = 50;
static int BUTTON_M4 = 51;
static int BUTTON_M5 = 52;
static int BUTTON_M6 = 53;
static int BUTTON_M7 = 54;
static int BUTTON_M8 = 55;
static int BUTTON_R1 = 64;
static int BUTTON_R2 = 65;
static int BUTTON_R3 = 66;
static int BUTTON_R4 = 67;
static int BUTTON_R5 = 68;
static int BUTTON_R6 = 69;
static int BUTTON_R7 = 70;
static int BUTTON_R8 = 71;
static int BUTTON_CYCLE = 46;
static int BUTTON_MARKER_SET = 60;
static int BUTTON_MARKER_LEFT = 61;
static int BUTTON_MARKER_RIGHT = 62;
static int BUTTON_TRACK_PREV = 58;
static int BUTTON_TRACK_NEXT = 59;



class Sifon {
  
  public PGraphics g;
  public SyphonServer server;

  Sifon(PApplet p, int width, int height, String rendererType){
    g = p.createGraphics(width, height, P3D);
    
    server = new SyphonServer(p, "Processing Syphon");
  }
 
  public void send(){
    server.sendImage(g);
  }


  public void begin() {
    g.beginDraw();
    g.background(0, 0);
    g.colorMode(HSB, 127);
  }

  public void end() {
    g.endDraw();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "chipsters_logos" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
