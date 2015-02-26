import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class vehicles extends PApplet {


Vehicle v;

public void setup() {
  size(800, 600);
  
  v = new Vehicle(width/2, height/2);
  
  
  
}

public void draw() {
  v.update();
  v.seek(new PVector(mouseX, mouseY));
  v.display();
}
class Vehicle {
  PVector location;
  PVector velocity;
  PVector acceleration;
  float maxspeed;
  float maxforce;
  
  float r;
  
  Vehicle(float x, float y) {
    location = new PVector(x, y);
    acceleration = new PVector(0, 0);
    velocity = new PVector(0, 0);
    
    r = 3.0f;
    maxspeed = 4;
    maxforce = 0.1f;
  }
  
  
  public void update() {
    velocity.add(acceleration);
    velocity.limit(maxspeed);
    location.add(velocity);
    acceleration.mult(0);
  }
  
  public void applyForce(PVector force) {
    acceleration.add(force);
  }
  
 
  public void seek(PVector target) {
    PVector desired = PVector.sub(target,location);
    desired.normalize();
    desired.mult(maxspeed);
    PVector steer = PVector.sub(desired,velocity);
    steer.limit(maxforce);
    applyForce(steer);
  }
  
  public void flee(PVector aggressor) {
    PVector desired = PVector.sub(aggressor, location);
    println("d:  " + desired.x + ", " + desired.y);
    desired.normalize();
    desired.mult(maxspeed);
    PVector steer = PVector.sub(desired, velocity);
    steer.limit(maxforce);
    
    steer.mult(-1);
    println("st: " + steer.x + ", " + steer.y);
    applyForce(steer);
  }



  public void display() {
    float theta = velocity.heading() + PI/2;
//    println (location.x + ", " + location.y);
    fill(175);
    stroke(0);
    pushMatrix();
    translate(location.x, location.y);
    rotate(theta);
    beginShape();
    vertex(0, -r*2);
    vertex(-r, r*2);
    vertex(r, r*2);
    endShape(CLOSE);
    popMatrix();
  }

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "vehicles" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
