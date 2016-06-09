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

public class enter_the_alice extends PApplet {

PShader myShader;



LazerController kontrol;
LazerSyphon send;

int width = 1920;
int height = 1080;

public void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("alice.glsl");

  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

}

public void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0f);

  float dirac_y = (float) map(kontrol.get("dirac_y"), 0, 127, -2, 10);
  myShader.set("dirac_y", dirac_y);

  float band_size = (float) map(kontrol.get("band_size"), 0, 127, 0, 0.5f);
  myShader.set("band_size", band_size);

  float speed = (float) map(kontrol.get("speed"), 0, 127, 0, 1);
  myShader.set("speed", speed);

  float speedMult = (float) map(kontrol.get("speedMult"), 0, 127, -1, 1);
  myShader.set("speedMult", speedMult);

  float mover = (float) map(kontrol.get("mover"), 0, 127, 1, 2000);
  myShader.set("mover", mover);

  float red = (float) map(kontrol.get("red"), 0, 127, 0.0f, 1.0f);
  myShader.set("red", red);

  float green = (float) map(kontrol.get("green"), 0, 127, 0.0f, 1.0f);
  myShader.set("green", green);  

  float blue = (float) map(kontrol.get("blue"), 0, 127, 0.0f, 1.0f);
  myShader.set("blue", blue);  

  float matX = (float) map(kontrol.get("matX"), 0, 127, -1.0f, 1.0f);
  myShader.set("matX", matX);

  float matY = (float) map(kontrol.get("matY"), 0, 127, -1.0f, 1.0f);
  myShader.set("matY", matY);

  float matZ = (float) map(kontrol.get("matZ"), 0, 127, -1.0f, 1.0f);
  myShader.set("matZ", matZ);

  float matQ = (float) map(kontrol.get("matQ"), 0, 127, -1.0f, 1.0f);
  myShader.set("matQ", matQ);


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
  send.g.fill(255, 0, 0);
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
  kontrol.setMapping("dirac_y", kontrol.SLIDER1, 60);
  kontrol.setMapping("band_size", kontrol.SLIDER2, 60);
  kontrol.setMapping("speed", kontrol.SLIDER3, 1);
  kontrol.setMapping("speedMult", kontrol.SLIDER4, 100);
  kontrol.setMapping("mover", kontrol.SLIDER5, 100);

  kontrol.setMapping("red", kontrol.KNOB1, 127);
  kontrol.setMapping("green", kontrol.KNOB2, 127);
  kontrol.setMapping("blue", kontrol.KNOB3, 127);

  kontrol.setMapping("matX", kontrol.KNOB5, 90);
  kontrol.setMapping("matY", kontrol.KNOB6, 80);
  kontrol.setMapping("matZ", kontrol.KNOB7, 30);
  kontrol.setMapping("matQ", kontrol.KNOB8, 90);

  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_alice" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
