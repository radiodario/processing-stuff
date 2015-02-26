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

public class enter_the_cubes extends PApplet {








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

public void setup()  {
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

public void draw()  {

  s.begin();
  if (kontrol.get("ortho") == 0) {
    s.g.ortho(0, width, 0, height);
  } else {
    float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
    float cameraZ = (height/2.0f) / tan(fov/2.0f);
    s.g.perspective(fov, PApplet.parseFloat(width)/PApplet.parseFloat(height), cameraZ/2.0f, cameraZ*2.0f);
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


public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

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


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

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


interface BeatListener {
  public void beat(); 
}

class BeatManager {
  EventDispatcher<BeatListener> listeners = new EventDispatcher<BeatListener>();
  
  int count = 0;
  int msecsFirst = 0;
  int msecsPrevious = 0;
    
  BeatThread b;
 
  
  BeatManager() {
    b = new BeatThread(this, millis(), 60000/120);
  }
  
  
  public void resetCount() {
    
    count = 0;

  }
 
  public void start() {
    b.start(); 
  }
  
  public void setBeat() {
    b.stopit();
    int msecs = millis();
   
    
    if ((msecs - msecsPrevious) > 2000) {
       resetCount();
    }
    
    if (count == 0) {
      msecsFirst = msecs;
      count = 1;
    } else {
      
      int bpmAvg = 60000 * count / (msecs - msecsFirst);
      
      println("bpm:" + (bpmAvg));
      
      b = new BeatThread(this, msecs, 60000 / bpmAvg);
      b.start();
      count++;
    } 
      
    
    msecsPrevious = msecs;
    
  }
  
  //trigger 
  public void broadcastEvent(BeatThread t) {
   for (BeatListener l : listeners) {
     l.beat();
   } 
  }

  public void beat() {
   for (BeatListener l : listeners) {
     l.beat();
   } 
  }

  
  
}

// the beat clock thread
class BeatThread extends Thread {
  long timeStamp;
  long interval;
  int MINUTE = 60000;
  boolean running;
  BeatManager parent;
  
  BeatThread(BeatManager parent, long timeStamp, int interval) {
    this.parent = parent;
    this.timeStamp = timeStamp;
    this.interval = interval;
    this.running = true;
  }
   
  public void run() {
   while (running) {
      beat(); 
    }
   
  }
  
  public void stopit() {
    this.running = false;
  }
  
  public void beat() {
    try {
      //parent.broadcastEvent(this);
      Thread.sleep(interval);
    } catch(InterruptedException e) {      
    }
  }
  
  
  
}

class Colors {
 
  ColorTheme t;
  ColorList l;
  int colorCounter;
  int numColors;
  
  public Colors(int numColors) {
    this.numColors = numColors; 
    
    this.colorCounter = 0;
    
    setRandomBrightColors();
  }
 
  public void setRandomBrightColors() {
    t = new ColorTheme("random");
    
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.BRIGHT, TColor.newRandom(), random(0.02f, 0.5f));
    
    l = t.getColors(numColors);
    
    
  }
  
  public void setRandomDarkColors() {
    t = new ColorTheme("random");
    
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    t.addRange(ColorRange.INTENSE, TColor.newRandom(), random(0.02f, 0.5f));
    
    l = t.getColors(numColors);
    
    
  }
 
 
  public void setVoidColors() {
    t = new ColorTheme("enter_the_void");
  
    t.addRange(ColorRange.BRIGHT, TColor.newHex("34232a"), 0.5547332f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5e3f6b"), 0.12577668f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("895844"), 0.07337354f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8a637a"), 0.027640717f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("3e816f"), 0.02567617f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("76331f"), 0.024122808f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("94679c"), 0.020239402f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("346238"), 0.016949927f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c44531"), 0.012701023f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("cc9718"), 0.0116959065f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f5da16"), 0.011101974f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ce9cb9"), 0.011056286f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("de7461"), 0.008954679f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("533399"), 0.007903874f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("9357ba"), 0.006761696f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6536bb"), 0.0065789474f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4db8a7"), 0.0061677634f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8eaa58"), 0.005391082f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("57a846"), 0.0046600876f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("dcc867"), 0.004431652f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("37257a"), 0.0042945906f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bad2b0"), 0.0038834065f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6c5d15"), 0.0029239766f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("af68f0"), 0.002741228f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b23997"), 0.0021472953f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f8632d"), 0.0021472953f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("da4ee6"), 0.0019188597f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("997a0b"), 0.0018731726f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5a7ea9"), 0.001370614f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e4dae5"), 0.001324927f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("51cb69"), 0.001050804f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("d349ad"), 0.001050804f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("8fa3bd"), 9.137427e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("e092ee"), 5.482456e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fbbcb3"), 5.482456e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ec44dd"), 5.025585e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a9c529"), 4.5687135e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c84c08"), 4.111842e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("81dda8"), 4.111842e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("385c87"), 3.6549708e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f38c90"), 3.6549708e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4d33f9"), 3.1980994e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a7375e"), 2.741228e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b49b85"), 2.741228e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("f7fa4f"), 2.2843567e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("493f00"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("30c3dc"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("893ef2"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("b68a44"), 1.8274854e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("fc801f"), 1.370614e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("83a409"), 1.370614e-4f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("5cc456"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("4f811a"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("6864d1"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a5d668"), 9.137427e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("c6edc0"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("ff9de5"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("862279"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("a6280f"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("617150"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("bffff4"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("739f85"), 4.5687135e-5f);
    t.addRange(ColorRange.BRIGHT, TColor.newHex("acbee2"), 4.5687135e-5f);
   
    l = t.getColors(numColors);

  }
 
 
  public int getAColor() {
    
     return l.get((int) random(numColors)).toARGB();
    
    
  }
  
  public int getNextColor() {
    return l.get(++colorCounter % numColors).toARGB();
    
  }
  
  public void update() {
    if (kontrol.get("setRandomBrightColors") > 0) {
      colors.setRandomBrightColors();
    }
    
    if (kontrol.get("setRandomDarkColors") > 0) {
      colors.setRandomDarkColors();
    }
    
    
    if (kontrol.get("setVoidColors") > 0) {
      colors.setVoidColors();
    } 
    
  }
  
}

class Cube implements BeatListener {
  
  int x;
  int y;
  int z;
  int h;
  int s;
  int l;
  float life = 1;
  int size;
    
  public Cube(int x, int y, int size) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.size = size;
  }

  public void beat() {
    if (kontrol.get("avoidBeat") == 0) {
      this.life = 0; 
    }
  }

  public void draw(PGraphics p) {
    p.pushMatrix();
    
    if (kontrol.get("zJitter") > 0) {
      int amt = kontrol.get("zJitterAmount");
      z = (int) random(-amt, amt);
    } else {
      z = 0;
    }
    
    p.translate(x, y, z);
    
    p.pushMatrix();
    if (kontrol.get("rotate") > 0) {
      p.rotateX(map(kontrol.get("rotateX"), 0, 127, 0, 2*PI));
      p.rotateY(map(kontrol.get("rotateY"), 0, 127, 0, 2*PI));
      p.rotateZ(map(kontrol.get("rotateZ"), 0, 127, 0, 2*PI));
    } else {
      p.rotateX(-PI/4); 
      p.rotateY(PI/4);
    }
    
    if (kontrol.get("fill") > 0) {
      
      if (kontrol.get("randomFill") > 0) {
        p.fill(colors.getAColor());
      } else if (kontrol.get("nextFill") > 0) {
        p.fill(colors.getNextColor());
      } else {
        p.fill(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }  
      
      
    } else {
      p.noFill();
    }
    
    p.strokeWeight(map(kontrol.get("strokeWidth"), 0, 127, 0.5f, 100));
    
    
    if (kontrol.get("stroke") > 0) {
      if (kontrol.get("randomStroke") > 0) {
        p.stroke(colors.getAColor());
      } else if (kontrol.get("nextStroke") > 0) {
        p.stroke(colors.getNextColor());
      } else {
        p.stroke(kontrol.get("hue"), kontrol.get("sat"), kontrol.get("bri"));
      }
    } else {
      p.noStroke();
    }
    
    
    if (kontrol.get("sphere") > 0) {
      p.sphereDetail((int)map(kontrol.get("sphereDetail"), 0, 127, 1, 10));
      p.sphere(life*size);
    } else {
      p.box(life*size);
    }
    p.popMatrix();
    p.popMatrix();
  }
  
  public void setColor(int h, int s, int l) {
    this.h = h;
    this.s = s;
    this.l = l;  
  }
  
  
  public void update() {
    
    if (kontrol.get("resetLife") > 0) {
      this.life = 0;
    }
    
    if (kontrol.get("fullLife") > 0) {
      this.life = 0;
    }
    
    
    if (kontrol.get("randomGrowth") > 0) {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.5f);
      this.life += random(-amt, amt) ;
    } else {
      float amt = map(kontrol.get("decay"), 0, 127, 0, 0.2f);
      this.life += amt;  
    }
    

    
    
  }
  
  public boolean dead() { 
    return false;
//    return (this.life <= 0);
  }
}
class Cubes {

  ArrayList<Cube> cubes;
  int numCubes;
  int cubesPerRow = 10;

  public Cubes(int max, BeatManager beatManager) {
    int cubeSide = width/cubesPerRow;

    numCubes = 30*30;

    cubes = new  ArrayList<Cube>();

    float x = 0, y = 0;
    int row = 0;
    int col = 0;

    for (int i = 0; i < numCubes; i++) {

      if (col > cubesPerRow) {
        row++;
        col = 0;
      }

      float gridStep = cubeSide * tan(PI/4);
      float gridStepY = cubeSide * sin(PI/4);

      if (row % 2 > 0) {
        x = col * (gridStep);
      } else {

        x = (col * gridStep) + gridStep/2;
      }

      y = gridStepY * row;

      col++;


      Cube newCube = new Cube((int)x,(int) y, (int) cubeSide);
      cubes.add(newCube);
      beatManager.listeners.addListener(newCube);

    }



  }


  public void draw(PGraphics p) {

    for (Cube cube : cubes) {
      cube.draw(p);
    }

  }


  public void update() {

    for (int i = cubes.size() - 1; i >= 0; i--) {
      Cube c = cubes.get(i);

      c.update();

      if (c.dead()) {
       cubes.remove(c);
      }

    }


  }

  public void addCube() {

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
   setMapping("decay", SLIDER1, 10);
   setMapping("resetLife", BUTTON_CYCLE);
   setMapping("fullLife", BUTTON_TRACK_PREV);
   setMapping("avoidBeat", BUTTON_TRACK_NEXT);
   setMapping("resetLife", BUTTON_R2);
   setMapping("setRandomBrightColors", BUTTON_MARKER_SET, 1);
   setMapping("setVoidColors", BUTTON_MARKER_LEFT);
   setMapping("setRandomDarkColors", BUTTON_MARKER_RIGHT);

   setMapping("randomGrowth", BUTTON_R3, 1);

   setMapping("fill", BUTTON_S1, 1);
   setMapping("stroke", BUTTON_M1, 0);

   setMapping("strokeWidth", SLIDER2);

   setMapping("fov", SLIDER7);

   setMapping("hue", KNOB1, 127);
   setMapping("sat", KNOB2, 100);
   setMapping("bri", KNOB3, 127);

   setMapping("randomFill", BUTTON_S2);
   setMapping("randomStroke", BUTTON_M2);

   setMapping("nextFill", BUTTON_S3, 1);
   setMapping("nextStroke", BUTTON_M3);

   setMapping("rotate", BUTTON_S4);
   setMapping("rotateX", KNOB4);
   setMapping("rotateY", KNOB5);
   setMapping("rotateZ", KNOB6);

   setMapping("zJitter", BUTTON_S6);
   setMapping("zJitterAmount", SLIDER6);

   setMapping("sphere", BUTTON_RWD);
   setMapping("sphereDetail", SLIDER8);

   setMapping("ortho", BUTTON_REC);
   setMapping("lights", BUTTON_R1,1);

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
    String[] appletArgs = new String[] { "enter_the_cubes" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}