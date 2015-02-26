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

public class hypnosis extends PApplet {

PShader myShader;


MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;

PImage texture;

int width = 1280;
int height = 1024;

public void setup() {
  size(800, 600, P3D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  myShader = loadShader("sea.glsl");
  myShader.set("amount", 0.0023f);
  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new Sifon(this, width, height, P3D);

}

public void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0f);
  float multi = (float) map(kontrol.get("multi"), 0, 127, 0.000001f, 0.0025f);
  // myShader.set("multi", multi);
  // float amount = (float) map(kontrol.get("amount"), 0, 127, 0.0001, 1);
  // myShader.set("amount", amount);
  // float barWidth = (float) map(kontrol.get("width"), 0, 127, -1, 1);
  // // myShader.set("width", barWidth);
  // myShader.set("width", 0.5);
}


public void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
  // This kind of effects are entirely implemented in the
  // fragment shader, they only need a quad covering the
  // entire view area so every pixel is pushed through the
  // shader.
  send.g.fill(255);
  send.g.rect(0, 0, width, height);
  send.g.resetShader();

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

public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

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
     println(mapping + ": -1 \n" + e);
     return -1;
   }

 }


 public void handleMidiEvent(int channel, int number, int value) {
   // println("Handled " + channel + " " + number + " " + value);
   if (number >= 0) {
     midiState[number] = value;
   }

 }


 public void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 public void setMapping(String name, int control) {
   mappings.put(name, control);
   midiState[control] = 0;
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 public void setMappings() {
   // how fast to gyrate
   setMapping("multi", SLIDER1, 1);
   // the width of the division
   setMapping("amount", SLIDER2, 1);
   // the width of the colour bars
   setMapping("width", SLIDER3, 1);


   setMapping("hideFrame", BUTTON_R5, 1);

 }

 public void printMappings() {
   int i = 1;
   pushMatrix();
   pushStyle();
   translate(0, 0);
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
   int y = (i * 15);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 14);
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
static int BASS;
static int MID;
static int HIGH;
static int PEAK;



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
    g.background(0);
    g.colorMode(HSB, 127);
  }

  public void end() {
    g.endDraw();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "hypnosis" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
