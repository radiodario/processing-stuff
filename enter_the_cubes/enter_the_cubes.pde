
import toxi.color.*;
import toxi.color.theory.*;

import lazer.viz.*;


LazerController kontrol;
LazerSyphon s;


Cubes cubes;
Colors colors;

Boolean setupReady = false;

int width = 800;
int height = 600;

void setup()  {
  size(800, 600, P2D);

  frameRate(60);


  kontrol = new LazerController(this);

  colors = new Colors(30*30);
  cubes = new Cubes(30, kontrol.beatManager);

  s = new LazerSyphon(this, width, height, P3D);

  setControls();

  setupReady = true;

}

void draw()  {

  if (kontrol.get("avoidBeat") > 0) {
    kontrol.beatManager.setBeat();
  }

  s.begin();
  if (kontrol.get("ortho") == 0) {
    s.g.ortho(0, width, 0, height);
  } else {
    float fov = PI/map(kontrol.get("fov"), 0, 127, 1, 10);
    float cameraZ = (height/2.0) / tan(fov/2.0);
    s.g.perspective(fov, float(width)/float(height), cameraZ/2.0, cameraZ*2.0);
  }

  if (kontrol.get("lights") > 0) {
    s.g.lights();
  }


  cubes.draw(s.g);
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
  cubes.update();
}

void setControls() {

  kontrol.setMapping("decay",  kontrol.SLIDER1, 10);
  kontrol.setMapping("resetLife",  kontrol.BUTTON_CYCLE);
  kontrol.setMapping("fullLife", kontrol.BUTTON_TRACK_PREV);
  kontrol.setMapping("avoidBeat",  kontrol.BUTTON_TRACK_NEXT);
  kontrol.setMapping("setRandomBrightColors",  kontrol.BUTTON_MARKER_SET, 1);
  kontrol.setMapping("setVoidColors",  kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors",  kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("randomGrowth", kontrol.BUTTON_R3, 1);
  kontrol.setMapping("fill", kontrol.BUTTON_S1, 1);
  kontrol.setMapping("stroke", kontrol.BUTTON_M1, 0);
  kontrol.setMapping("strokeWidth",  kontrol.SLIDER2);
  kontrol.setMapping("fov",  kontrol.SLIDER7);
  kontrol.setMapping("hue",  kontrol.KNOB1, 127);
  kontrol.setMapping("sat",  kontrol.KNOB2, 100);
  kontrol.setMapping("bri",  kontrol.KNOB3, 127);
  kontrol.setMapping("randomFill", kontrol.BUTTON_S2);
  kontrol.setMapping("randomStroke", kontrol.BUTTON_M2);
  kontrol.setMapping("nextFill", kontrol.BUTTON_S3, 1);
  kontrol.setMapping("nextStroke", kontrol.BUTTON_M3);
  kontrol.setMapping("rotate", kontrol.BUTTON_S4);
  kontrol.setMapping("rotateX",  kontrol.KNOB4);
  kontrol.setMapping("rotateY",  kontrol.KNOB5);
  kontrol.setMapping("rotateZ",  kontrol.KNOB6);
  kontrol.setMapping("zJitter",  kontrol.BUTTON_S6);
  kontrol.setMapping("zJitterAmount",  kontrol.SLIDER6);
  kontrol.setMapping("sphere", kontrol.BUTTON_RWD);
  kontrol.setMapping("sphereDetail", kontrol.SLIDER8);
  kontrol.setMapping("ortho",  kontrol.BUTTON_REC);
  kontrol.setMapping("lights", kontrol.BUTTON_R1,1);
  kontrol.setMapping("hideFrame",  kontrol.BUTTON_R5, 1);


  kontrol.setNoteControl("decay", kontrol.VDMX_MID);
}
