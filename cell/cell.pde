import pbox2d.*;

import org.jbox2d.collision.shapes.*;
import org.jbox2d.common.*;
import org.jbox2d.dynamics.*;
import org.jbox2d.dynamics.joints.*;

PBox2D box2d;

Entity[] cells;

PImage atlas;

int whichFrame = 0;
int numOfCells = 100;

void setup() {
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

void draw() {
  box2d.step();
  fill(200, 200);
  rect(0, 0, width, height);
  for (int i = 0; i < cells.length; i++){
    cells[i].display();
  }
   
}


void keyPressed() {
 
  
}

void mousePressed() {
  
}
