import toxi.color.*;
import toxi.color.theory.*;

import lazer.viz.*;

Triangles triangles;
Colors colors;

LazerController kontrol;
LazerSyphon s;

int width = 800;
int height = 600;

void setup() {
  size(800, 600, P2D);

  triangles = new Triangles();

  kontrol = new LazerController(this);
  kontrol.beatManager.register(triangles);
  setControls();
  colors = new Colors(30*30);

  s = new LazerSyphon(this, width, height, P3D);

}

void draw() {

  s.begin();
  triangles.draw(s.g);
  s.end();
  s.send();


  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(s.g, 200, 100, width/2, height/2);
  }
  kontrol.printMappings();
  text("running", 10, 10);

  colors.update();

}

void setControls() {
  kontrol.setMapping("decay", kontrol.SLIDER1, 100);
  kontrol.setMapping("reset", kontrol.BUTTON_S8, 1);
  kontrol.setMapping("fullLife", kontrol.BUTTON_TRACK_PREV);
  kontrol.setMapping("resetLife", kontrol.BUTTON_R2);
  kontrol.setMapping("setRandomBrightColors", kontrol.BUTTON_MARKER_SET);
  kontrol.setMapping("setVoidColors", kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors", kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("beating", kontrol.BUTTON_PLAY);
  kontrol.setMapping("showMappings", kontrol.BUTTON_R8);
  kontrol.setMapping("randomGrowth", kontrol.BUTTON_R3);
  kontrol.setMapping("fill", kontrol.BUTTON_S1);
  kontrol.setMapping("stroke", kontrol.BUTTON_M1, 1);
  kontrol.setMapping("strokeWidth", kontrol.SLIDER2, 2);
  kontrol.setMapping("fov", kontrol.SLIDER7);
  kontrol.setMapping("hue", kontrol.KNOB1, 127);
  kontrol.setMapping("sat", kontrol.KNOB2, 65);
  kontrol.setMapping("bri", kontrol.KNOB3, 127);
  kontrol.setMapping("randomFill", kontrol.BUTTON_S2);
  kontrol.setMapping("randomStroke", kontrol.BUTTON_M2);
  kontrol.setMapping("nextFill", kontrol.BUTTON_S3);
  kontrol.setMapping("nextStroke", kontrol.BUTTON_M3, 2);
  kontrol.setMapping("rotate", kontrol.BUTTON_S4);
  kontrol.setMapping("rotateX", kontrol.KNOB4);
  kontrol.setMapping("rotateY", kontrol.KNOB5);
  kontrol.setMapping("rotateZ", kontrol.KNOB6);
  kontrol.setMapping("zJitter", kontrol.BUTTON_S6);
  kontrol.setMapping("zJitterAmount", kontrol.SLIDER6);
  kontrol.setMapping("sphere", kontrol.BUTTON_RWD);
  kontrol.setMapping("sphereDetail", kontrol.SLIDER8, 10);
  kontrol.setMapping("maxSize", kontrol.KNOB8);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  kontrol.setNoteControl("strokeWidth", kontrol.VDMX_LOW);
  kontrol.setNoteControl("strokeWidth", kontrol.VDMX_MID);
}
