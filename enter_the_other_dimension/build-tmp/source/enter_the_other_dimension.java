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

public class enter_the_other_dimension extends PApplet {

int[][] result;
float t, c;

public float ease(float p) {
  return 3*p*p - 2*p*p*p;
}

public float ease(float p, float g) {
  if (p < 0.5f)
    return 0.5f * pow(2*p, g);
  else
    return 1 - 0.5f * pow(2*(1 - p), g);
}

float mn = .5f*sqrt(3);

public void setup() {
  setup_();
  result = new int[width*height][3];
}

public void draw() {

  if(!recording){
    t = mouseX*1.0f/width;
    c = mouseY*1.0f/height;
    if(mousePressed)
        println(c);
    draw_();
  }

  else {
  for (int i=0; i<width*height; i++)
    for (int a=0; a<3; a++)
      result[i][a] = 0;

  c = 0;
  for (int sa=0; sa<samplesPerFrame; sa++) {
    t = map(frameCount-1 + sa*shutterAngle/samplesPerFrame, 0, numFrames, 0, 1);
    draw_();
    loadPixels();
    for (int i=0; i<pixels.length; i++) {
      result[i][0] += pixels[i] >> 16 & 0xff;
      result[i][1] += pixels[i] >> 8 & 0xff;
      result[i][2] += pixels[i] & 0xff;
    }
  }

  loadPixels();
  for (int i=0; i<pixels.length; i++)
    pixels[i] = 0xff << 24 |
      PApplet.parseInt(result[i][0]*1.0f/samplesPerFrame) << 16 |
      PApplet.parseInt(result[i][1]*1.0f/samplesPerFrame) << 8 |
      PApplet.parseInt(result[i][2]*1.0f/samplesPerFrame);
  updatePixels();

  saveFrame("f###.gif");
  if (frameCount==numFrames)
    exit();
  }
}

//////////////////////////////////////////////////////////////////////////////

int samplesPerFrame = 8;
int numFrames = 240;
float shutterAngle = .33f;

boolean recording = false;

public void setup_() {
  size(800,600,P3D);
  rectMode(CENTER);
  stroke(250);
  strokeWeight(3.5f);
  smooth(8);
  ortho();
  noFill();
}

public void ver(float xx, float yy, float zz){
  tt = ease(constrain(1.4f*((3*t)%1)-map(yy,-l/2,l/2,0,.4f),0,1),2.5f);
  vertex(xx*cos(HALF_PI*tt) + zz*sin(HALF_PI*tt), yy, zz*cos(HALF_PI*tt) - xx*sin(HALF_PI*tt));
}

float x, y, z, tt;
float l = 195;
float ww = 1;
float xrot = atan(sqrt(.5f));

public void draw_() {
  background(0xffB55EB2);
  pushMatrix();
  translate(width/2, height/2);
  rotateX(xrot);
  rotateY(QUARTER_PI);
  if(3*t<=1)
    rotateX(HALF_PI);
  else if(3*t <= 2)
    rotateZ(HALF_PI);

  for(int i=0; i<4; i++){
    for(int j=0; j<4; j++){
      x = map(i,0,3,-l/2,l/2);
      y = map(j,0,3,-l/2,l/2);
      beginShape();
      for(int a=0; a<100; a++){
        z = map(a,0,99,-l/2-ww,l/2+ww);
        ver(x,y,z);
      }
      endShape();
    }
  }

  for(int i=0; i<4; i++){
    for(int j=0; j<4; j++){
      x = map(i,0,3,-l/2,l/2);
      z = map(j,0,3,-l/2,l/2);
      beginShape();
      for(int a=0; a<100; a++){
        y = map(a,0,99,-l/2-ww,l/2+ww);
        ver(x,y,z);
      }
      endShape();
    }
  }

  for(int i=0; i<4; i++){
    for(int j=0; j<4; j++){
      y = map(i,0,3,-l/2,l/2);
      z = map(j,0,3,-l/2,l/2);
      beginShape();
      for(int a=0; a<100; a++){
        x = map(a,0,99,-l/2-ww,l/2+ww);
        ver(x,y,z);
      }
      endShape();
    }
  }
  popMatrix();
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_other_dimension" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
