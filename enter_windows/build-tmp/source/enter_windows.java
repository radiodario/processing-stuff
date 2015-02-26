import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import toxi.color.*; 
import toxi.color.theory.*; 
import toxi.util.datatypes.*; 
import toxi.util.events.*; 
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

public class enter_windows extends PApplet {







MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;

int numstars=100;
int SPREAD=64;
int CX,CY;
float SPEED=5;

int width = 4104;
int height = 2520;

PImage windows;
PImage winSprite;
PImage floppySprite;
PImage foodSprite;
PImage gameboySprite;
PImage macSprite;
PImage playstationSprite;


PImage[] winIcons;

Star[] s = new Star[numstars];

public void setup(){
  size(800,600,P2D);
  colorMode(RGB,255);
  noFill();
  CX=width/2 ; CY=height/2;

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  send = new Sifon(this, width, height, P2D);

  windows = loadImage("windows.png");
  winSprite = loadImage("win98.gif");
  floppySprite = loadImage("floppies.gif");
  foodSprite = loadImage("food.gif");
  gameboySprite = loadImage("gameboy.gif");
  macSprite = loadImage("mac.gif");
  playstationSprite = loadImage("playstation.gif");

  for(int i=0;i<numstars;i++){
    s[i]=new Star();
    s[i].SetPosition();
  }



}

public void draw(){

  send.begin();

  if (kontrol.get("drawBackground") > 0) {
    send.g.background(0,0,0);
  }

  for(int i=0;i<numstars;i++){
    s[i].DrawStar(send.g);
  }

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

public PImage getRandomImage() {

  // there are 132 icons
  int whichOne = floor(random(0, 108));

  // 15 icons per row
  int row = (whichOne / 15);
  int col = whichOne % 15;
  int w = (floppySprite.width / 15) + 1;



  int what = (int) map(kontrol.get("drawWhat"), 0, 127, 0, 6);
  PImage randomImage;


  switch (what) {
    case 0:
      randomImage = winSprite.get(row * w, col * w, w, w);
      break;
    case 1:
      randomImage = floppySprite.get(row * w, col * w, w, w);
      break;
    case 2:
      randomImage = foodSprite.get(row * w, col * w, w, w);
      break;
    case 3:
      randomImage = gameboySprite.get(row * w, col * w, w, w);
      break;
    case 4:
      randomImage = macSprite.get(row * w, col * w, w, w);
      break;
    case 5:
      randomImage = playstationSprite.get(row * w, col * w, w, w);
      break;
    case 6:
      randomImage = windows;
      break;
    default:
      randomImage = windows;
      break;
  }

  return randomImage;

//  int whichOne = floor(random(0, 107));
//
//  return winIcons[whichOne];

}





public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

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


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);

  // if (channel == 1) {
  //   kontrol.setControlValueFromNote("spread", pad);
  // }

  if (channel == 1) {
    kontrol.setControlValueFromNote("maxSize", pad);
  }




}


class Star {
  float x=0,y=0,z=0,sx=0,sy=0, size;
  PImage sprite;

  public void SetPosition(){
    z=(float) random(200,255);
    x=(float) random(-1000,1000);
    y=(float) random(-1000,1000);
    sprite = getRandomImage();
  }

  public void DrawStar(PGraphics p){



    if (z < kontrol.get("speed")){
      this.SetPosition();
    }
    z -= kontrol.get("speed");
    sx = (x * kontrol.get("spread")) / (z) + CX;
    sy = (y * kontrol.get("spread"))/(4+z)+CY;

    size = map(z, 255, -250, 0, kontrol.get("maxSize")*10);

    if (sx<0 | sx>width){
      this.SetPosition();
    }
    if (sy<0 | sy>height){
      this.SetPosition();
    }
    p.tint(color(255 - (int) z,255 - (int) z,255 - (int) z));


    //image(windows, sx, sy, size, size);
    p.imageMode(CENTER);
    p.image(sprite, sx, sy, size, size);

    //ellipse( (int) sx,(int) sy,20,20);
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


  public void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 public void setMapping(String name, int control) {
   mappings.put(name, control);
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }

 public void setMappings() {
  setMapping("speed", SLIDER4, 2);
  setMapping("spread", SLIDER5, 60);
  setMapping("maxSize", SLIDER6, 50);
  setMapping("drawBackground", BUTTON_REC);

  setMapping("drawWindows", BUTTON_RWD);
  setMapping("drawFloppies", BUTTON_FWD);
  setMapping("drawWhat", KNOB5, 50);

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
    g.background(0);
    g.colorMode(HSB, 127);
  }

  public void end() {
    g.endDraw();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_windows" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
