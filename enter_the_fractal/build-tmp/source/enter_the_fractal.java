import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import lazer.viz.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class enter_the_fractal extends PApplet {

PShader myShader;



LazerController kontrol;
LazerSyphon send;

PImage texture;

int width = 1024;
int height = 768;

public void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("shader.glsl");
  myShader.set("amount", 0.0023f);
  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

}

public void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0f);
  float multi = (float) map(kontrol.get("multi"), 0, 127, 0.000001f, 0.0025f);

  float timeOffset1 = (float) map(kontrol.get("timeOffset1"), 0, 127, 1, 10);
  float timeOffset2 = (float) map(kontrol.get("timeOffset2"), 0, 127, 1, 10);
  float timeOffset3 = (float) map(kontrol.get("timeOffset3"), 0, 127, 1, 10);
  myShader.set("timeOffset1", timeOffset1);
  myShader.set("timeOffset2", timeOffset2);
  myShader.set("timeOffset3", timeOffset3);

}


public void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
  // This kind of effects are entirely implemented in the
  // fragment shader, they only need a quad covering the
  // entire view area so every pixel is pushed through the
  // shader.
  send.g.fill(255);
  send.g.rect(0, 0, width, height);
  send.g.resetShader();

  send.end();
  send.send();

  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(send.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);
}

public void setControls() {

  kontrol.setMapping("timeOffset1", kontrol.SLIDER1, 1);
  kontrol.setMapping("timeOffset2", kontrol.SLIDER2, 1);
  kontrol.setMapping("timeOffset3", kontrol.SLIDER3, 1);

  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  kontrol.setNoteControl("timeOffset1", kontrol.VDMX_LOW);
  kontrol.setNoteControl("timeOffset2", kontrol.VDMX_MID);
  kontrol.setNoteControl("timeOffset3", kontrol.VDMX_HIGH);

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_fractal" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
