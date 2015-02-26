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

public class pendular extends PApplet {

// I think there's a bug in here
 
float magnitude = 0;
float baseAngle = 0;
int lineSpacer = 4;
int yOffset = 80;
 
float cx;
float cy;
float newcx;
float newcy;
 
public void setup() {
 
  size(1024, 768);
  colorMode(HSB, 360, 100, 100);
  cx = width * 0.80f;
  cy = height/2;
  newcx = cx;
  newcy = cy;
}
 
public void draw() {  
 
 
  // Variables for wave
  float angle = baseAngle;
  float div = 36;
  int segment = 50;
  float x = segment;
  float lastY = height/2;
 
  background(0);
 
  //for (int i = segment; i < (width * .66) - segment; i += segment) {
  for (int i = 0; i <= 11; i++) {
 
    float y = height/2 + sin(radians(angle)) * magnitude/2;
 
    // Wave circles
    noStroke();
    fill(0, 0, 100);
    ellipse(x, y, 50, 50); 
 
    // Lines from top
    int lc = PApplet.parseInt(map(i, 0, 11, 0, 360));
    stroke(lc, 80, 80);
    strokeWeight(1);
    line(x, yOffset - i * lineSpacer, x, y);
    line(x, yOffset - i * lineSpacer, cx, yOffset - i * lineSpacer);
 
    // Update values
    angle += div;
    x += segment;
  }
 
  // Right circle
 
  stroke(0);
  strokeWeight(1);
  noFill();
 
  if (dist(cx, cy, mouseX, mouseY) < 125) {
    newcx = mouseX;
    newcy = mouseY; 
    magnitude = dist(cx, cy, mouseX, mouseY);
    baseAngle = degrees(atan2(cy - mouseY, cx - mouseX)) + 150;
  }
 
  for (int i = 0; i < 12; i++) {  
    int lc = PApplet.parseInt(map(i, 0, 11, 0, 360));
    float a = i * 30 + 90;
    stroke(lc, 80, 80);
    line(cx + cos(radians(a)) * 125, cy + sin(radians(a)) * 125, cx, yOffset - i * lineSpacer);
  } 
 
  fill(0, 0, 100);
  noStroke();
  ellipse(cx, cy, 250, 250);
 
  for (int i = 0; i < 12; i++) {  
    int lc = PApplet.parseInt(map(i, 0, 11, 0, 360));
    float a = i * 30 + 90;
    stroke(lc, 80, 80);
    line(newcx, newcy, cx + cos(radians(a)) * 125, cy + sin(radians(a)) * 125);
  }
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "pendular" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
