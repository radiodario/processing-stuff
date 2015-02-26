import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import pbox2d.*; 
import themidibus.*; 
import toxi.util.events.*; 
import org.jbox2d.collision.shapes.*; 
import org.jbox2d.common.*; 
import org.jbox2d.dynamics.*; 
import org.jbox2d.dynamics.joints.*; 
import codeanticode.syphon.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class chibispace extends PApplet {










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

public void setup() {
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

public void draw() {
  
  s.begin();
  
  float speed = kontrol.get("scrollSpeed");
  
  if (kontrol.get("drawSkyBox") > 0) {
    xPos0 -= speed * 0.1f;
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
    
    xPos -= speed * 0.8f;
    xPos2 -= speed * 1.1f;
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

    // println("Handled " + channel + " " + number + " " + value);

  }
  
}


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {

  // println(timestamp + " - Handled noteon " + channel + " " + pad + " " + velocity + " " + bus_name);

  // kontrol.handleMidiEvent(channel, pad, velocity);

  if (pad == 0) {
    beatManager.beat();  
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
class Chibis {
  boolean canAdd = true;
  int numOfChibis = 20;
  ArrayList<Entity> chibiEntities;
  
  int lastSpawn = 0;
  int spawnEvery = 500;
  
  Chibis() {
    chibiEntities = new ArrayList<Entity>(); 
  }
  
  public void draw(PGraphics g) {
    for (Entity e : chibiEntities){
      e.display(g);
    }
  
    text(chibiEntities.size(), 10, 10);
  
  
  }
  
  public void update() {
     // remove dead chibis
     spawnEvery = (int) map(kontrol.get("spawnRate"), 0, 127, 1000, 1);
  
     
     for (int i = chibiEntities.size() - 1; i >= 0; i--) {
       Entity e = chibiEntities.get(i);
       if (e.dead()) {
         chibiEntities.remove(i);
         e.kill();
       }
     }
    
     if (chibiEntities.size() < numOfChibis) {
       int now = millis();
       
       if ((lastSpawn + spawnEvery) < now) {
         addChibi();
         lastSpawn = now; 
       }
            
     }
  }
  
  public void addChibi() {

    Entity newChibi = new Entity("chibi-sprites.xml", random(25,width-25), height+150);

    chibiEntities.add(newChibi);

    beatManager.listeners.addListener(newChibi);

  }
  
  
  
}
class Entity implements BeatListener {
 
   ArrayList<Sprite> sprites;
   Body body;
   float w;
   float h;
   //int currentSprite;
   String currentAction;
   HashMap<String, Integer[]> actions;
   String[] actionNames;
   PImage atlas;
   
   Entity (String filename, float x, float y) {
     loadAtlas(filename);
     
     loadActions(filename);
  

     w =70;
     h = 130;
     
     //currentAction = "lucky";
     setRandomCurrentAction();
     //currentSprite = 0;
     
     makeBody(new Vec2(x, y), w, h);
   }
   
   public void beat() {
     setRandomCurrentAction(); 
   }


   public void kill() {
     box2d.destroyBody(body);
   }
   
   public void setRandomCurrentAction() {
     currentAction = actionNames[(int) random(0, actionNames.length-1)];
   };
   
   
   public boolean dead() {
     Vec2 pos = box2d.getBodyPixelCoord(body);
     
     if (pos.y < -h) {
//     if (pos.y > height+h) {
       
       return true;
     }
    
     return false;
  }
  
  public void setVelocity() {
    Vec2 vel = new Vec2(0, map(kontrol.get("velocity"), 0, 127, 0, 1000));
    
    body.setLinearVelocity(vel); 
    
  }
  
  
  public void display(PGraphics p) {
    
    
    setVelocity();
    
    if (kontrol.get("randomSprite") > 0) {
      setRandomCurrentAction();
    }
    
    Integer [] action = actions.get(currentAction);
    
    int currentFrame = frameCount % action.length;
   
    int currentSprite = action[currentFrame];
    
    //println(currentSprite + " is the current sprite");
    
    
    Vec2 pos = box2d.getBodyPixelCoord(body);
    
    float a = body.getAngle();
   
    p.pushMatrix();
    p.translate(pos.x, pos.y);
    p.rotate (-a);
    sprites.get(currentSprite).draw(p, atlas,(int) pos.x,(int) pos.y);
    p.popMatrix(); 

    
  }
  
  public void loadAtlas(String filename) {
    XML sheet = loadXML(filename);
    String imgPath = sheet.getString("imagePath");
    
    atlas = loadImage(imgPath);
  }
  
  public void loadActions(String filename) {
    XML sheet = loadXML(filename);
    
    XML[] actionNodes = sheet.getChildren("action");
    
    
    
    actions = new HashMap<String, Integer[]>();
    actionNames = new String[actionNodes.length];
    sprites = new ArrayList<Sprite>();
    int spriteNumber = 0;
    for (int i = 0; i < actionNodes.length; i++) {
      actionNames[i] = actionNodes[i].getString("n"); 
      XML[] spriteNodes = actionNodes[i].getChildren("sprite"); 
      Integer [] spriteIds = new Integer[spriteNodes.length];

      
      for (int j = 0; j < spriteNodes.length; j++) {
        spriteIds[j] = spriteNumber;
        String name = spriteNodes[j].getString("n");
        int x = spriteNodes[j].getInt("x");
        int y = spriteNodes[j].getInt("y");
        int w = spriteNodes[j].getInt("w");
        int h = spriteNodes[j].getInt("h");
        
        sprites.add(new Sprite(name, x, y, w, h));
        spriteNumber++;
        }
        
//        println(actionNodes[i].getString("n") + " " + spriteIds);
        
        actions.put(actionNodes[i].getString("n"), spriteIds);
      
    }
  
  }
  


  // This function adds the rectangle to the box2d world
  public void makeBody(Vec2 center, float w_, float h_) {

    // Define a polygon (this is what we use for a rectangle)
    PolygonShape sd = new PolygonShape();
    float box2dW = box2d.scalarPixelsToWorld(w_/2);
    float box2dH = box2d.scalarPixelsToWorld(h_/2);
    sd.setAsBox(box2dW, box2dH);

    // Define a fixture
    FixtureDef fd = new FixtureDef();
    fd.shape = sd;
    // Parameters that affect physics
    fd.density = 0.1f;
    fd.friction = 0.1f;
    fd.restitution = 0.2f;

    // Define the body and make it from the shape
    BodyDef bd = new BodyDef();
    bd.type = BodyType.DYNAMIC;
    bd.position.set(box2d.coordPixelsToWorld(center));
    bd.angle = 0;//random(TWO_PI);

    body = box2d.createBody(bd);
    body.createFixture(fd);
    
  }
  

}

class Sprite {

  String name;
  int x;
  int y;
  int w;
  int h; 
  

 
  Sprite(String _name, int _x, int _y, int _w, int _h) {
    name = _name;
    x = _x;
    y = _y;
    w = _w;
    h = _h;
  }
 
  public void draw(PGraphics p, PImage atlas, int px, int py) {
    PImage texture = atlas.get(x, y, w, h);
    if (kontrol.get("biggernearer") > 0) {
      float amount = 2 + (sin((abs(py%height)*TWO_PI)/(height)));
      float newHeight = (texture.height * amount);
      float newWidth = (texture.width * amount);
      texture.resize(ceil(newWidth), ceil(newHeight));
      
      p.image(texture, -texture.width/2, -texture.height/2);
      
    } else {
      p.image(texture, -w/2, -h/2);
    }
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


 

 public void setMapping(String name, int control) {
   mappings.put(name, control);
 } 


 public void setMappings() {
   mappings.put("spawnRate", SLIDER1);
   mappings.put("decay", SLIDER2);
   mappings.put("velocity", SLIDER3);
   
   mappings.put("randomSprite", BUTTON_REC);

   mappings.put("hue", KNOB1);
   mappings.put("sat", KNOB2);
   mappings.put("bri", KNOB3);
   
   mappings.put("drawSkyBox", BUTTON_S1);
   mappings.put("drawBuildings", BUTTON_S2);
   mappings.put("drawLogo", BUTTON_S3);
   
   mappings.put("biggernearer", BUTTON_PLAY);
   mappings.put("drawChibis", BUTTON_RWD);
   
   mappings.put("scrollSpeed", SLIDER4);

   mappings.put("hideFrame", BUTTON_R6);

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
    String[] appletArgs = new String[] { "chibispace" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
