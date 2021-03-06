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

public class analog_attack_logos extends PApplet {


PImage eindbaas;
PImage analog;
PImage ltc_bk;
PImage ltc_wt;
PImage treyfrey;
PImage shirobon;
PImage jddj3j;
PImage chipzel;
PImage sabrepulse_fc;
PImage sabrepulse_bk;

PImage current;



LazerSyphon s;
LazerController kontrol;
// MidiBus nanoKontrol;
// MidiBus vdmxKontrol;

int width = 1024;
int height = 768;


public void setup() {
  size(800, 600, P2D);

  eindbaas = loadImage("eindbaas.png");
  analog = loadImage("logo.png");
  ltc_bk = loadImage("ltc_bk.png");
  ltc_wt = loadImage("ltc_wt.png");
  treyfrey = loadImage("trey-frey.png");
  shirobon = loadImage("shirobon.jpg");
  jddj3j = loadImage("jddj3j.png");
  chipzel = loadImage("chipzel.png");
  sabrepulse_fc = loadImage("sabrepulse_fc.png");
  sabrepulse_bk = loadImage("sabrepulse_bk.png");


  // MidiBus.list();
  // nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  // vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");


  kontrol = new LazerController(this);


  s = new LazerSyphon(this, width, height, P2D);

}


public void setImage() {
  // if (kontrol.get("eindbaas") > 0) {
  //   current = eindbaas;
  // }

  // if (kontrol.get("analog") > 0) {
  //   current = analog;
  // }

  // if (kontrol.get("ltc_bk") > 0) {
  //   current = ltc_bk;
  // }

  // if (kontrol.get("ltc_wt") > 0) {
  //   current = ltc_wt;
  // }

  // if (kontrol.get("treyfrey") > 0) {
  //   current = treyfrey;
  // }

  // if (kontrol.get("shirobon") > 0) {
  //   current = shirobon;
  // }

  // if (kontrol.get("jddj3j") > 0) {
  //   current = jddj3j;
  // }

  // if (kontrol.get("chipzel") > 0) {
  //   current = chipzel;
  // }

  // if (kontrol.get("sabrepulse_fc") > 0) {
    current = sabrepulse_fc;
  // }

  // if (kontrol.get("sabrepulse_bk") > 0) {
  //   current = sabrepulse_bk;
  // }

}


public void draw() {


  s.begin();

  s.g.imageMode(CENTER);

  // if (kontrol.get("safeLock") == 0) {
    setImage();
  // }

  s.g.image(current, width/2, height/2);


  s.end();
  s.send();


  background(0);
  fill(255);
  // if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(s.g, 200, 100, width/2, height/2);
  // }
  kontrol.printMappings();
  text("running", 10, 10);


}


public void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  try {
    if (bus_name == "nanoKontrol") {
      kontrol.handleMidiEvent(channel, number, value);

    }

    if (bus_name == "vdmxKontrol") {

    }

  } catch (Exception e) {

  }

}


public void noteOn(int channel, int pad, int velocity, long timestamp, String bus_name) {



}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "analog_attack_logos" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
