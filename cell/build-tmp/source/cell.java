import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import pbox2d.*; 
import org.jbox2d.collision.shapes.*; 
import org.jbox2d.common.*; 
import org.jbox2d.dynamics.*; 
import org.jbox2d.dynamics.joints.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class cell extends PApplet {








PBox2D box2d;

Entity[] cells;

PImage atlas;

int whichFrame = 0;
int numOfCells = 100;

public void setup() {
  size(800, 600);
  frameRate(30);
  
  
  box2d = new PBox2D(this);
  box2d.createWorld();
  box2d.setGravity(0, -20);
  
  cells = new Entity[numOfCells];
  
  for (int i = 0; i < cells.length; i++){
    cells[i] = new Entity("cell.xml", random(0,width), random(-20, 0));
  }
  
  noCursor();
  
}

public void draw() {
  box2d.step();
  fill(200, 200);
  rect(0, 0, width, height);
  for (int i = 0; i < cells.length; i++){
    cells[i].display();
  }
   
}


public void keyPressed() {
 
  
}

public void mousePressed() {
  
}
class Entity {
 
   ArrayList<Sprite> sprites;
   Body body;
   float w;
   float h;
   //int currentSprite;
   String currentAction;
   HashMap<String, Integer[]> actions;
   PImage atlas;
   
   Entity (String filename, float x, float y) {
     loadAtlas(filename);
     
     loadActions(filename);
  

     w = 83;
     h = 148;
     
     currentAction = "start";
     //currentSprite = 0;
     
     makeBody(new Vec2(x, y), w, h);
   }
   
   
   public void kill() {
     box2d.destroyBody(body);
   }
   
   
   public boolean dead() {
     Vec2 pos = box2d.getBodyPixelCoord(body);
     if (pos.y > height+w*h) {
       kill();
       return true;
     }
    
     return false;
  }
  
  public void display() {
    
    Integer [] action = actions.get(currentAction);
    
    int currentFrame = frameCount % action.length;
   
    int currentSprite = action[currentFrame];
    
    //println(currentSprite + " is the current sprite");
    
    
    Vec2 pos = box2d.getBodyPixelCoord(body);
    
    float a = body.getAngle();
   
    pushMatrix();
    translate(pos.x, pos.y);
    rotate (-a);
    sprites.get(currentSprite).draw(atlas, 0, 0);
    popMatrix(); 

    
  }
  
  public void loadAtlas(String filename) {
    XML sheet = loadXML(filename);
    String imgPath = sheet.getString("imagePath");
    
    atlas = loadImage(imgPath);
  }
  
  public void loadActions(String filename) {
    XML sheet = loadXML(filename);
    
    XML[] actionNodes = sheet.getChildren("action");
    
    println(actionNodes);
    
    actions = new HashMap<String, Integer[]>();
    sprites = new ArrayList<Sprite>();
    int spriteNumber = 0;
    for (int i = 0; i < actionNodes.length; i++) {
     
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
        
        println(actionNodes[i].getString("n") + " " + spriteIds);
        
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
    fd.density = 1;
    fd.friction = 0.3f;
    fd.restitution = 0.2f;

    // Define the body and make it from the shape
    BodyDef bd = new BodyDef();
    bd.type = BodyType.DYNAMIC;
    bd.position.set(box2d.coordPixelsToWorld(center));
    bd.angle = random(TWO_PI);

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
 
  public void draw(PImage atlas, int px, int py) {
    PImage texture = atlas.get(x, y, w, h);
    pushMatrix();
    translate(px, py);
    //imageMode(CENTER);
    image(texture, -w/2, -h/2);
    popMatrix();
  }
 
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "cell" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
