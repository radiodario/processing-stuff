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

public class enter_the_fluid extends PApplet {

PShader systemShader;
PShader fluidShader;



LazerController kontrol;
LazerSyphon send;

PImage textd;

PGraphics systemBuffer;

int width = 1024;
int height = 768;

public void setup() {
  size(800, 600, P3D);

  systemBuffer = createGraphics(width, height, P3D);

  kontrol = new LazerController(this);
  setControls();
  textd = loadImage("tex10.png");

  systemShader = loadShader("system.glsl");
  systemShader.set("noise", textd);
  systemShader.set("texture", systemBuffer.get());
  systemShader.set("iFrame", frameCount);
  systemShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  fluidShader = loadShader("fluid.glsl");
  fluidShader.set("texture", systemBuffer.get());
  fluidShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));


  send = new LazerSyphon(this, width, height, P3D);

}

public void updateShader() {

  systemShader.set("iFrame", frameCount);
  systemShader.set("texture", systemBuffer.get());

  systemBuffer.beginDraw();
  systemBuffer.background(255);
  systemBuffer.shader(systemShader);
  systemBuffer.fill(255);
  systemBuffer.rect(0, 0, width, height);
  systemBuffer.endDraw();
  

  fluidShader.set("texture", systemBuffer.get());
  float red = (float) map(kontrol.get("red"), 0, 127, -1, 1);
  float green = (float) map(kontrol.get("green"), 0, 127, -1, 1);
  float blue = (float) map(kontrol.get("blue"), 0, 127, -1, 1);
  fluidShader.set("baseColor", red, green, blue);
}


public void draw() {

  updateShader();

  send.begin();
  send.g.background(0);
  send.g.shader(fluidShader);
  send.g.fill(255);
  send.g.rect(0, 0, width, height);
  send.end();
  send.send();

  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(send.g, 200, 100, width/2, height/2);
    image(systemBuffer, 200, 400, width/2, height/2);
  }
  kontrol.printMappings();
  text(frameRate + " " + frameCount, 10, 10);
  
}

public void setControls() {

  kontrol.setMapping("zoom", kontrol.SLIDER3, 50);
  //kontrol.setNoteControl("zoom", kontrol.VDMX_LOW);
  // base R component for sea
  kontrol.setMapping("red", kontrol.KNOB1, 2);
  // base G component for sea
  kontrol.setMapping("green", kontrol.KNOB2, 4);
  // base B component for sea
  kontrol.setMapping("blue", kontrol.KNOB3, 9);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_fluid" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
