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

public class stolen_from_japan extends PApplet {

int numPoints = 1200;
int lengthLimit = 80;
int hueColor;
int bgColor;
Point[] points;

boolean save = false;

public void setup(){
  size(displayWidth, displayHeight, P3D);
  smooth(32);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();
  reset();
}

public void reset(){
  hueColor = PApplet.parseInt(random(360));
  bgColor = color(hueColor, 15, 80);
  points = new Point[numPoints];
  for(int i = 0; i < numPoints; i++){
    points[i] = new Point();
  }
}

public void draw(){
  background(bgColor);
  translate(width/2, height/2, 0);
  
  for(int i = 0; i < points.length; i++){
    Point fromP = points[i];
    ArrayList<Point> nearPs = new ArrayList<Point>();
    for(int j = 0; j < points.length; j++){
      Point toP = points[j];
      float dist = dist(fromP.x, fromP.y, fromP.z, toP.x, toP.y, toP.z);
      if(dist < lengthLimit){
        nearPs.add(toP);
      }
    }
    strokeWeight(0.5f);
    stroke(200, 50);
    fill(fromP.col);
    beginShape();
    for(Point p : nearPs){
      vertex(p.x, p.y, p.z);
    }
    endShape(CLOSE);
  }
  
  if(save){
    saveFrame("img/img-"+(int)random(10000)+".jpg");
    save = false;
  }
  reset();
  redraw();
}

public void mousePressed(){
  if(mouseButton == LEFT){
    reset();
    redraw();
  }
  else if(mouseButton == RIGHT){
    save = true;
    redraw();
  }
}

class Point{
  float x, y, z;
  float radius;
  int col;
  
  Point(){
    float s = 0;
    int r = (int)random(7);
    if(r == 0)           s = random(0, QUARTER_PI);
    if(r >= 1 && r <= 5) s = random(QUARTER_PI, 3*QUARTER_PI);
    if(r == 6)           s = random(3*QUARTER_PI, PI);
    float t = random(TWO_PI);
    if(random(2) < 1){
      radius = 450;
    }
    else radius = 250;
    x = radius * sin(s) * cos(t);
    y = radius * cos(s);
    z = radius * sin(s) * sin(t);
    col = color(hueColor+random(60), random(80), random(20, 100), random(100));
  }
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "stolen_from_japan" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
