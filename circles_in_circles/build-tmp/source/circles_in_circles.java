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

public class circles_in_circles extends PApplet {

// copyrite dw

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
  size(540,540);
  noStroke();
}

float d;
float ff = .65f;
int N = 24;

public void draw_() {
  d = 400;
  background(250);
  pushMatrix();
  translate(width/2, height/2);
  rotate(-HALF_PI);
  fill(32);
  ellipse(0, 0, d, d);
  for (int i=0; i<N; i++) {
    d *= ff;
    pushMatrix();
    rotate(TWO_PI*t + PI*i);
    translate(.5f*d*(1/ff-1), 0);
    fill(i%2 == 0 ? 250 : 32);
    ellipse(0, 0, d, d);
  }
  for (int i=0; i<N; i++)
    popMatrix();
  popMatrix();
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "circles_in_circles" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
