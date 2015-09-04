PShader myShader;
import lazer.viz.*;

LazerController kontrol;

LazerSyphon send;

PImage texture;

int width = 1024;
int height = 768;

void setup() {
  size(800, 600, P3D); //P3D? Why not OpenGL??? ;_____;
  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("sea.glsl");
  myShader.set("resolution", float(width), float(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

void updateShader() {
  myShader.set("iGlobalTime", millis() / 1000.0);

  float seaHeight = (float) map(kontrol.get("seaHeight"), 0, 127, 0, 1);
  myShader.set("SEA_HEIGHT", seaHeight);

  float seaChoppy = (float) map(kontrol.get("seaChoppy"), 0, 127, 0, 3);
  myShader.set("SEA_CHOPPY", seaChoppy);

  float seaSpeed = (float) map(kontrol.get("seaSpeed"), 0, 127, 0, 3);
  myShader.set("SEA_SPEED", seaSpeed);

  float seaFreq = (float) map(kontrol.get("seaFreq"), 0, 127, 0, 1);
  myShader.set("SEA_FREQ", seaFreq);

  seaColor();


  float multX = (float) map(kontrol.get("moveMultX"), 0, 127, 0, 5);
  float multY = (float) map(kontrol.get("moveMultY"), 0, 127, 0, 5);
  float multZ = (float) map(kontrol.get("moveMultZ"), 0, 127, 0, 5);

  myShader.set("MOVE_MULTS", multX, multY, multZ);

}


void seaColor() {
  float seaBaseR = (float) map(kontrol.get("seaBaseR"), 0, 127, 0, 1);
  float seaBaseG = (float) map(kontrol.get("seaBaseG"), 0, 127, 0, 1);
  float seaBaseB = (float) map(kontrol.get("seaBaseB"), 0, 127, 0, 1);
  myShader.set("SEA_BASE", seaBaseR, seaBaseG, seaBaseB);

  float seaR = (float) map(kontrol.get("seaWaterR"), 0, 127, 0, 1);
  float seaG = (float) map(kontrol.get("seaWaterG"), 0, 127, 0, 1);
  float seaB = (float) map(kontrol.get("seaWaterB"), 0, 127, 0, 1);
  myShader.set("SEA_WATER_COLOR", seaR, seaG, seaB);


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

  // Kontroller controls

  // the height of the sea
  kontrol.setMapping("seaHeight", kontrol.SLIDER1, 50);
  // how choppy is the sea
  kontrol.setMapping("seaChoppy", kontrol.SLIDER2, 100);
  // how fast is the sea
  kontrol.setMapping("seaSpeed", kontrol.SLIDER3, 30);
  // the frequency of the sea
  kontrol.setMapping("seaFreq", kontrol.SLIDER4, 10);
  // base R component for sea
  kontrol.setMapping("seaBaseR", kontrol.KNOB1, 2);
  // base G component for sea
  kontrol.setMapping("seaBaseG", kontrol.KNOB2, 4);
  // base B component for sea
  kontrol.setMapping("seaBaseB", kontrol.KNOB3, 9);
  // water R
  kontrol.setMapping("seaWaterR", kontrol.KNOB4, 100);
  // water G
  kontrol.setMapping("seaWaterG", kontrol.KNOB5, 120);
  // water B
  kontrol.setMapping("seaWaterB", kontrol.KNOB6, 130);
  kontrol.setMapping("moveMultX", kontrol.SLIDER5, 0);
  kontrol.setMapping("moveMultY", kontrol.SLIDER6, 0);
  kontrol.setMapping("moveMultZ", kontrol.SLIDER7, 0);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  // VDMX note controls
  kontrol.setNoteControl("seaHeight", kontrol.VDMX_LOW);
}