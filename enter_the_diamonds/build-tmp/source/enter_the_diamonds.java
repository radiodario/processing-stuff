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

public class enter_the_diamonds extends PApplet {

PShader myShader;


LazerController kontrol;

LazerSyphon send;

PImage texture;

int width = 1280;
int height = 720;

public void setup() {
  size(800, 600, P3D); //P3D? Why not OpenGL??? ;_____;
  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("diamonds.glsl");
  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

public void updateShader() {
  myShader.set("iGlobalTime", millis() / 2000.0f);
}


public void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
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

  // Kontroller controls

  // the height of the sea
  kontrol.setMapping("seaHeight", kontrol.SLIDER1, 50);
  // how choppy is the sea
  
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  // VDMX note controls
  kontrol.setNoteControl("seaHeight", kontrol.VDMX_LOW);
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_diamonds" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
