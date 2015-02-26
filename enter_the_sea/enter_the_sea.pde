PShader myShader;
import themidibus.*;

MidiBus nanoKontrol;
MidiBus vdmxKontrol;
Controller kontrol;
Sifon send;

PImage texture;

int width = 1280;
int height = 720;

void setup() {
  size(800, 600, P3D);

  MidiBus.list();
  nanoKontrol = new MidiBus(this, "SLIDER/KNOB", "CTRL", "nanoKontrol");
  vdmxKontrol = new MidiBus(this, "From VDMX", "To VDMX", "vdmxKontrol");

  kontrol = new Controller();

  myShader = loadShader("sea.glsl");
  myShader.set("resolution", float(width), float(height));

  send = new Sifon(this, width, height, P3D);

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

void controllerChange(int channel, int number, int value, long timestamp, String bus_name) {

  // println(timestamp + " - Handled controllerChange " + channel + " " + number + " " + value + " " + bus_name);

  if (bus_name == "nanoKontrol") {
    kontrol.handleMidiEvent(channel, number, value);
  }

  if (bus_name == "vdmxKontrol") {

    // println("Handled " + channel + " " + number + " " + value);

  }

}