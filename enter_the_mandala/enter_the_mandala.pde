PShader myShader;

import lazer.viz.*;

LazerController kontrol;
LazerSyphon send;

PImage texture;

int width = 1024;
int height = 768;

void setup() {
  size(800, 600, P3D);

  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("mandala.glsl");

  myShader.set("resolution", float(width), float(height));

  send = new LazerSyphon(this, width, height, P3D);

}

void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0);

  // float dirac_y = (float) map(kontrol.get("dirac_y"), 0, 127, -2, 10);
  // myShader.set("dirac_y", dirac_y);

  float thickness = (float) map(kontrol.get("thickness"), 0, 127, 0, 1);
  myShader.set("thickness", thickness);

  float speed = (float) map(kontrol.get("speed"), 0, 127, 0, 50);
  myShader.set("speed", speed);

}


void draw() {

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

void setControls() {
  // the y coords of the sea of dirac
  kontrol.setMapping("thickness", kontrol.SLIDER1, 60);
  kontrol.setMapping("speed", kontrol.SLIDER3, 1);
  // kontrol.setMapping("dirac_y", kontrol.SLIDER1, 60);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);
}