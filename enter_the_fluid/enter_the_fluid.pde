PShader systemShader;
PShader fluidShader;

import lazer.viz.*;

LazerController kontrol;
LazerSyphon send;

PImage textd;
PImage sb;


PGraphics systemBuffer;

int width = 800;
int height = 600;
int bw = width;
int bh = height;

void setup() {
  size(800, 600, P3D);

  systemBuffer = createGraphics(bw, bh, P3D);

  kontrol = new LazerController(this);
  setControls();
  textd = loadImage("tex11.png");

  systemShader = loadShader("system.glsl");
  systemShader.set("noise", textd);
  systemShader.set("texture", systemBuffer.get());
  systemShader.set("iFrame", frameCount);
  systemShader.set("resolution", float(bw), float(bh));

  fluidShader = loadShader("fluid.glsl");
  fluidShader.set("texture", systemBuffer.get());
  fluidShader.set("resolution", float(width), float(height));


  send = new LazerSyphon(this, width, height, P3D);

}

void updateShader() {

  systemShader.set("iFrame", frameCount);
  

  sb = systemBuffer.get();

  systemShader.set("texture", sb);
  systemBuffer.beginDraw();
  systemBuffer.background(255);
  systemBuffer.shader(systemShader);
  systemBuffer.fill(255);
  systemBuffer.rect(0, 0, width, height);
  systemBuffer.endDraw();
  

  fluidShader.set("texture", sb);
  float red = (float) map(kontrol.get("red"), 0, 127, -1, 1);
  float green = (float) map(kontrol.get("green"), 0, 127, -1, 1);
  float blue = (float) map(kontrol.get("blue"), 0, 127, -1, 1);
  fluidShader.set("baseColor", red, green, blue);
}


void draw() {

  updateShader();

  send.begin();
  send.g.background(0);
  send.g.shader(fluidShader);
  send.g.fill(255);
  send.g.rect(0, 0, width, height);
  send.end();
  send.send();

  background(0);
  fill(255);
  if (kontrol.get("hideFrame") > 0) {
    text("preview:", 200, 90);
    image(send.g, 200, 100, width/2, height/2);
    image(sb, 200, 400, bw/2, bh/2);
  }
  kontrol.printMappings();
  text(frameRate + " " + frameCount, 10, 10);
  
}

void setControls() {

  //kontrol.setMapping("zoom", kontrol.SLIDER3, 50);
  //kontrol.setNoteControl("zoom", kontrol.VDMX_LOW);
  // base R component for sea
  kontrol.setMapping("red", kontrol.KNOB1, 125);
  // base G component for sea
  kontrol.setMapping("green", kontrol.KNOB2, 4);
  // base B component for sea
  kontrol.setMapping("blue", kontrol.KNOB3, 125);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

}