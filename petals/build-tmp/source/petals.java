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

public class petals extends PApplet {

public void setup() {
  size(640, 480);
  background(255);
}
 
public void draw() {  
  base(PApplet.parseInt(random(width)),PApplet.parseInt(random(height)));
  delay(100*(30/frameCount));
}
 
public void mousePressed() {
  frameCount = 0;
  background(255);
}
 
public void base(int x, int y) {
  //Pick a random base color
  int a = PApplet.parseInt(random(255));
  int b = PApplet.parseInt(random(255));
  int c = PApplet.parseInt(random(255));
  int base = color(a, b, c);
  int r = 10 + PApplet.parseInt(random(30));
  fill(base);
  ellipse(x, y, r, r);
  noFill();
  
  //Create 5-20 petals from the base
  int numPetals = 5+PApplet.parseInt(random(15));
  int rbg = PApplet.parseInt(random(2));
  for(int index = 0; index < numPetals; index++)
  {
    fill(shade(base, rbg));
    petal(x, y, r, base);
    noFill();
  }
}
 
public void petal(int x, int y, int r, int base) {
  pushMatrix();
  int rotation = PApplet.parseInt(random(360));
  translate(x, y);
  rotate(radians(rotation));
  beginShape();
  vertex(0, -r);
  bezierVertex(-15, -15, -30, -30, 15-random(30), -random(30));
  bezierVertex( 15, -15, 15, -30, 0, -r);
  endShape();
  popMatrix();
}
 
public int shade(int base, int rbg) {
  int seed = PApplet.parseInt(100-random(200));
  int r = PApplet.parseInt(red(base));
  int b = PApplet.parseInt(blue(base));
  int g = PApplet.parseInt(green(base));
  if(rbg == 0) {
    if(r+seed > 255 || r+seed < 0)
      seed = -seed;
    return color(r+seed, b, g);
  }
  if(rbg == 1) {
    if(g+seed > 255 || g+seed < 0)
      seed = -seed;
    return color(r, b+seed, g);
  }
  if(rbg == 2) {
    if(b+seed > 255 || b < 0)
      seed = -seed;
    return color(r, b, g+seed);
  }
  else
    println("SOMETHING WENT WRONG");
  return color(0,0,0);
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "petals" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
