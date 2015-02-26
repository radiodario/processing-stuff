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

public class enter_the_reaction extends PApplet {

PShader gs;
float feed = 0.037f;
float kill = 0.06f;
float delta = 1;


PImage kata;

boolean doMouse = false;

public void setup() {
  size(1280, 1024, P2D);
  gs = loadShader("shader.glsl");
  gs.set("screen", PApplet.parseFloat(width), PApplet.parseFloat(height));
  gs.set("delta", delta);
  gs.set("feed", feed);
  gs.set("kill", kill);
  kata = loadImage("ti_yong.png");
  imageMode(CENTER);
}

public void draw() {
  //image(kata, width/2, height/2);
  if (doMouse) {
    gs.set("mouse", PApplet.parseFloat(mouseX), PApplet.parseFloat(height-mouseY));
  }
  for (int i = 0; i < 20; i++) {
    filter(gs);
  }
}

public void mousePressed() {
  doMouse = true;
}

public void mouseReleased() {
  doMouse = false;
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "enter_the_reaction" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
