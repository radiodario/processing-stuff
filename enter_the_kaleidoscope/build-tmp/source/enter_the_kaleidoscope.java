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

public class enter_the_kaleidoscope extends PApplet {

PShader myShader;



LazerController kontrol;
LazerSyphon send;
PImage textd;


int width = 1024;
int height = 768;

public void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();
  textd = loadImage("tex15.png");
  myShader = loadShader("kaleido 2.glsl");
  myShader.set("texture", textd);
  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

}

public void updateShader() {

  float speed = (float) map(kontrol.get("speed"), 0, 127, 0, 1);
  myShader.set("speed", speed);


  //myShader.set("iGlobalTime", millis() / 10000.0);
  myShader.set("time", millis() / 10000.0f);

  float tau_inverse = (float) map(kontrol.get("tau_inverse"), 0, 127, 1, 10);
  myShader.set("tau_inverse", tau_inverse);

  float time_mult = (float) map(kontrol.get("time_mult"), 0, 127, 0, 1);
  myShader.set("time_mult", time_mult);

  float zoom = (float) map(kontrol.get("zoom"), 0, 127, 1, 10);
  myShader.set("zoom", zoom);

  int iterations = (int) map(kontrol.get("iterations"), 0, 127, 1, 50);
  myShader.set("iterations", iterations);

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
  // the y coords of the sea of dirac
  kontrol.setMapping("speed", kontrol.KNOB6, 100);
  kontrol.setMapping("tau_inverse", kontrol.SLIDER1, 100);
  kontrol.setMapping("time_mult", kontrol.SLIDER2, 60);
  kontrol.setMapping("zoom", kontrol.SLIDER3, 50);
  kontrol.setNoteControl("zoom", kontrol.VDMX_LOW);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
  kontrol.setMapping("iterations", kontrol.KNOB5, 150);
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_kaleidoscope" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
