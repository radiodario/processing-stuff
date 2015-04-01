import toxi.color.*;
import toxi.color.theory.*;
import lazer.viz.*;


LazerController kontrol;
LazerSyphon send;

Colors colors;

int width = 560;
int height = 560;

Noisefield noisefield;

void setup() {
  size(800, 600, P2D);

  kontrol = new LazerController(this);
  setControls();
  send = new LazerSyphon(this, width, height, P3D);

  colors = new Colors(30*30);

  noisefield = new Noisefield(width);

}


void draw() {

  // float updateRate = map(kontrol.get("updateRate"), 0, 127, 0, 10);

  // if (frameCount % (updateRate +1) == 0) {
  noisefield.update();
  // }

  colors.update();

  send.begin();
  noisefield.draw(send.g);
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

void setControls() {
  kontrol.setMapping("bgAlpha", kontrol.SLIDER1, 10);
  kontrol.setMapping("fgAlpha", kontrol.SLIDER2, 127);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
  kontrol.setMapping("strokeWidth", kontrol.SLIDER3, 10);
  kontrol.setMapping("setRandomBrightColors", kontrol.BUTTON_MARKER_SET, 1);
  kontrol.setMapping("setVoidColors", kontrol.BUTTON_MARKER_LEFT);
  kontrol.setMapping("setRandomDarkColors", kontrol.BUTTON_MARKER_RIGHT);
  kontrol.setMapping("setGradient", kontrol.BUTTON_CYCLE);
  kontrol.setMapping("voidColors", kontrol.BUTTON_M1, 1);
  kontrol.setMapping("reset", kontrol.BUTTON_TRACK_NEXT);
  kontrol.setMapping("charwidth", kontrol.KNOB1, 10);
  kontrol.setMapping("xSpeed", kontrol.SLIDER4, 64);
  kontrol.setMapping("ySpeed", kontrol.SLIDER5, 64);
  kontrol.setMapping("step", kontrol.KNOB7, 2);
  kontrol.setMapping("rotate", kontrol.BUTTON_R4, 0);
  kontrol.setMapping("factor", kontrol.BUTTON_R2, 0);
  kontrol.setMapping("elevation", kontrol.SLIDER8, 0);
  kontrol.setMapping("elevationFactor", kontrol.KNOB8);
  kontrol.setMapping("updateRate", kontrol.KNOB3, 0);
  kontrol.setMapping("drawLines", kontrol.BUTTON_PLAY, 1);
  kontrol.setMapping("rotateCam", kontrol.BUTTON_S4);
  kontrol.setMapping("zoom", kontrol.SLIDER6);
  kontrol.setMapping("fov", kontrol.SLIDER7);
  kontrol.setMapping("rotateX", kontrol.KNOB4);
  kontrol.setMapping("rotateY", kontrol.KNOB5);
  kontrol.setMapping("rotateZ", kontrol.KNOB6);

  kontrol.setNoteControl("elevation", kontrol.VDMX_LOW);
  //kontrol.setNoteControl("maxSize", kontrol.VDMX_MID);
  //kontrol.setNoteControl("strokeWidth", kontrol.VDMX_HIGH);
}



