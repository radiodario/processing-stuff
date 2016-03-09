PShader myShader;
import lazer.viz.*;

LazerController kontrol;

LazerSyphon send;

PImage texture;

int width = 1280;
int height = 720;

void setup() {
  size(800, 600, P3D); //P3D? Why not OpenGL??? ;_____;
  kontrol = new LazerController(this);
  setControls();

  myShader = loadShader("diamonds.glsl");
  myShader.set("resolution", float(width), float(height));

  send = new LazerSyphon(this, width, height, P3D);

  updateShader();

}

void updateShader() {
  myShader.set("iGlobalTime", millis() / 2000.0);
  float delta = (float) map(kontrol.get("DELTA"), 0, 127, 0.0, 0.01);
  myShader.set("DELTA", delta);
  int rayCount = (int) map(kontrol.get("RAY_COUNT"), 0, 127, 0, 10);
  myShader.set("RAY_COUNT", rayCount);
  float rayLengthMax = (float) map(kontrol.get("RAY_LENGTH_MAX"), 0, 127, 0, 127);
  myShader.set("RAY_LENGTH_MAX", rayLengthMax);
  int rayStepMax = (int) map(kontrol.get("RAY_STEP_MAX"), 0, 127, 0, 100);
  myShader.set("RAY_STEP_MAX", rayStepMax);
  float refractFactor = (float) map(kontrol.get("REFRACT_FACTOR"), 0, 127, 0, 1);
  myShader.set("REFRACT_FACTOR", refractFactor);
  float refractIndex = (float) map(kontrol.get("REFRACT_INDEX"), 0, 127, 0, 3);
  myShader.set("REFRACT_INDEX", refractIndex);
  float ambient = (float) map(kontrol.get("AMBIENT"), 0, 127, 0, 1);
  myShader.set("AMBIENT", ambient);
  float specularPower = (float) map(kontrol.get("SPECULAR_POWER"), 0, 127, 0, 10);
  myShader.set("SPECULAR_POWER", specularPower);
  float specularIntensity = (float) map(kontrol.get("SPECULAR_INTENSITY"), 0, 127, 0, 1);
  myShader.set("SPECULAR_INTENSITY", specularIntensity);
  float fadePower = (float) map(kontrol.get("FADE_POWER"), 0, 127, 0, 2);
  myShader.set("FADE_POWER", fadePower);
  float glowFactor = (float) map(kontrol.get("GLOW_FACTOR"), 0, 127, 0, 5);
  myShader.set("GLOW_FACTOR", glowFactor);
  float luminosityFactor = (float) map(kontrol.get("LUMINOSITY_FACTOR"), 0, 127, 0, 5);
  myShader.set("LUMINOSITY_FACTOR", luminosityFactor);
}


void draw() {

  updateShader();

  send.begin();
  send.g.background(255);
  send.g.shader(myShader);
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
  kontrol.setMapping("DELTA", kontrol.KNOB1, 1);
  kontrol.setMapping("RAY_COUNT", kontrol.KNOB2, 100);
  kontrol.setMapping("RAY_LENGTH_MAX", kontrol.KNOB3, 100);
  kontrol.setMapping("RAY_STEP_MAX", kontrol.KNOB4, 75);
  kontrol.setMapping("REFRACT_FACTOR", kontrol.SLIDER1, 100);
  kontrol.setMapping("REFRACT_INDEX", kontrol.SLIDER2, 100);
  kontrol.setMapping("AMBIENT", kontrol.SLIDER3, 100);
  kontrol.setMapping("SPECULAR_POWER", kontrol.KNOB8, 100);
  kontrol.setMapping("SPECULAR_INTENSITY", kontrol.KNOB7, 100);
  kontrol.setMapping("FADE_POWER", kontrol.SLIDER4, 100);
  kontrol.setMapping("GLOW_FACTOR", kontrol.SLIDER5, 100);
  kontrol.setMapping("LUMINOSITY_FACTOR", kontrol.KNOB5, 100);
  kontrol.setMapping("hideFrame", kontrol.BUTTON_R5, 1);

  // VDMX note controls
  kontrol.setNoteControl("LUMINOSITY_FACTOR", kontrol.VDMX_LOW);
}
