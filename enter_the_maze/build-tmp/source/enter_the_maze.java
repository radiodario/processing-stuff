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

public class enter_the_maze extends PApplet {

PShader mazeShader;



LazerController kontrol;
LazerSyphon send;
PImage textd;


int width = 1280;
int height = 720;

public void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();
  textd = loadImage("tex10.png");
  mazeShader = loadShader("maze.glsl");
  mazeShader.set("texture", textd);
  mazeShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

}

public void updateShader() {

  // float speed = (float) map(kontrol.get("speed"), 0, 127, 0, 1);
  // mazeShader.set("speed", speed);

  mazeShader.set("iGlobalTime", millis() / 1000.0f);

  float zoom = (float) map(kontrol.get("zoom"), 0, 127, 1, 100);
  mazeShader.set("zoom", zoom);

  float red = (float) map(kontrol.get("red"), 0, 127, 0, 1);
  float green = (float) map(kontrol.get("green"), 0, 127, 0, 1);
  float blue = (float) map(kontrol.get("blue"), 0, 127, 0, 1);
  mazeShader.set("baseColor", red, green, blue);

}


public void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(mazeShader);
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

  kontrol.setMapping("zoom", kontrol.SLIDER3, 50);
  kontrol.setNoteControl("zoom", kontrol.VDMX_LOW);
  // base R component for sea
  kontrol.setMapping("red", kontrol.KNOB1, 2);
  // base G component for sea
  kontrol.setMapping("green", kontrol.KNOB2, 4);
  // base B component for sea
  kontrol.setMapping("blue", kontrol.KNOB3, 9);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_maze" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
