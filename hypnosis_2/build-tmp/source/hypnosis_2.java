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

public class hypnosis_2 extends PApplet {

PShader myShader;



LazerController kontrol;
LazerSyphon send;

PImage texture;

int width = 800;
int height = 600;

public void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("shader.glsl");
  myShader.set("resolution", PApplet.parseFloat(width), PApplet.parseFloat(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

public void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0f);

  float scaleFactor = (float) map(kontrol.get("scaleFactor"), 0, 127, 1, 20);
  myShader.set("scaleFactor", scaleFactor);
  int iterations = (int) map(kontrol.get("iterations"), 0, 127, 1, 50);
  myShader.set("Iterations", iterations);
  int pParam = (int) map(kontrol.get("pParam"), 0, 127, 1, 6);
  int qParam = (int) map(kontrol.get("qParam"), 0, 127, 1, 6);
  int rParam = (int) map(kontrol.get("rParam"), 0, 127, 1, 6);
  myShader.set("pParam", pParam);
  myShader.set("qParam", qParam);
  myShader.set("rParam", rParam);

  float sRadius = (float) map(kontrol.get("SRadius"), 0, 127, 0, 0.5f);
  myShader.set("SRadius", sRadius);

  float segR = (float) map(kontrol.get("segColorR"), 0, 127, 0, 1);
  float segG = (float) map(kontrol.get("segColorG"), 0, 127, 0, 1);
  float segB = (float) map(kontrol.get("segColorB"), 0, 127, 0, 1);

  float bgR = (float) map(kontrol.get("bgColorR"), 0, 127, 0, 1);
  float bgG = (float) map(kontrol.get("bgColorG"), 0, 127, 0, 1);
  float bgB = (float) map(kontrol.get("bgColorB"), 0, 127, 0, 1);

  myShader.set("segColor", segR, segG, segB);
  myShader.set("backGroundColor", bgR, bgG, bgB);


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
  kontrol.setMapping("scaleFactor", kontrol.KNOB7, 100);
  kontrol.setMapping("iterations", kontrol.KNOB8, 4);
  kontrol.setMapping("pParam", kontrol.SLIDER5, 10);
  kontrol.setMapping("qParam", kontrol.SLIDER6, 10);
  kontrol.setMapping("rParam", kontrol.SLIDER7, 10);
  kontrol.setMapping("SRadius", kontrol.SLIDER8, 10);
  kontrol.setMapping("segColorR", kontrol.KNOB1, 2);
  kontrol.setMapping("segColorG", kontrol.KNOB2, 4);
  kontrol.setMapping("segColorB", kontrol.KNOB3, 9);
  kontrol.setMapping("bgColorR", kontrol.KNOB4, 100);
  kontrol.setMapping("bgColorG", kontrol.KNOB5, 120);
  kontrol.setMapping("bgColorB", kontrol.KNOB6, 130);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  kontrol.setNoteControl("sRadius", kontrol.VDMX_LOW);
}





class Controller {


 int[] midiState;

 HashMap<String,Integer> mappings;


 public Controller() {
   midiState = new int[128];
   mappings = new HashMap<String, Integer>();
   setMappings();
 }


 public int get(String mapping) {

   try {
//     println(mapping + ": " + midiState[mappings.get(mapping)]);
     return midiState[mappings.get(mapping)];
   }
   catch (Exception e) {
     println(mapping + ": -1 \n" + e);
     return -1;
   }

 }


 public void handleMidiEvent(int channel, int number, int value) {
   // println("Handled " + channel + " " + number + " " + value);
   if (number >= 0) {
     midiState[number] = value;
   }

 }


 public void setControlValueFromNote(String name, int value) {
   midiState[mappings.get(name)] = value;
 }


 public void setMapping(String name, int control) {
   mappings.put(name, control);
   midiState[control] = 0;
 }

 public void setMapping(String name, int control, int initialValue) {
  mappings.put(name, control);
  midiState[mappings.get(name)] = initialValue;
 }


 public void setMappings() {



 }

 public void printMappings() {
   int i = 1;
   pushMatrix();
  // bas
   pushStyle();
   translate(0, 0);
   fill(0, 0, 0, 80);
   strokeWeight(1);
   stroke(0, 0, 0);
   rect(0, 0, 200, height);

   text("Mappings", 10, 10);
   for (String key : mappings.keySet()) {
      drawMapping(key, ++i);
   }

   popStyle();
   popMatrix();


 }

 public void drawMapping(String key, int i) {

   int x = 10;
   int y = (i * 15);

   fill(255, 150, 200, 100);
   rect(x - 1, y-10, this.get(key), 14);
   fill(255, 0, 255);
   text(key + " = " + this.get(key), x, y);
 }



}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "hypnosis_2" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
